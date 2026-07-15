const fs = require('fs');
const path = require('path');

let mongoose;
let isMock = true;

// Attempt to load real mongoose if MongoDB is configured
if (process.env.MONGODB_URI) {
  try {
    mongoose = require('mongoose');
    isMock = false;
  } catch (err) {
    console.warn("Mongoose dependency failed to load, falling back to JSON local DB.", err);
  }
}

// Ensure the local data directory exists
const dataDir = path.join(process.cwd(), 'backend', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function connectDB() {
  if (!isMock && mongoose) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ Real MongoDB connected successfully via Mongoose'))
      .catch((err) => {
        console.error('❌ MongoDB Connection failed, falling back to JSON DB:', err.message);
        isMock = true;
      });
  } else {
    console.log('📦 Operating in Local File-Backed Persistence Mode (backend/data/*.json)');
  }
}

// Custom Mock Mongoose Model implementation
class MockModel {
  constructor(modelName, data = {}) {
    this._id = data._id || Math.random().toString(36).substring(2, 11);
    Object.assign(this, data);
    if (!this.createdAt) this.createdAt = new Date().toISOString();
    if (!this.updatedAt) this.updatedAt = new Date().toISOString();
  }

  static initialize(modelName) {
    this.modelName = modelName;
    this.collectionName = modelName.toLowerCase() + 's';
  }

  static getFilePath() {
    return path.join(dataDir, `${this.collectionName}.json`);
  }

  static readData() {
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (e) {
      console.error(`Error reading ${this.collectionName} JSON:`, e);
      return [];
    }
  }

  static writeData(data) {
    const filePath = this.getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  static async find(query = {}) {
    const items = this.readData();
    const filtered = items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined) {
          // Support simple exact match and $or operator
          if (key === '$or' && Array.isArray(query[key])) {
            const match = query[key].some(q => {
              for (const k in q) {
                if (item[k] !== q[k]) return false;
              }
              return true;
            });
            if (!match) return false;
            continue;
          }
          if (item[key] !== query[key]) {
            return false;
          }
        }
      }
      return true;
    });
    return filtered.map(item => new this(this.modelName, item));
  }

  static async findOne(query = {}) {
    const items = await this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  static async findById(id) {
    if (!id) return null;
    const items = this.readData();
    const item = items.find(item => String(item._id) === String(id));
    return item ? new this(this.modelName, item) : null;
  }

  static async create(data) {
    const items = this.readData();
    const newRecord = {
      _id: Math.random().toString(36).substring(2, 11),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newRecord);
    this.writeData(items);
    return new this(this.modelName, newRecord);
  }

  static async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (!id) return null;
    const items = this.readData();
    const idx = items.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return null;

    items[idx] = {
      ...items[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.writeData(items);
    return new this(this.modelName, items[idx]);
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const items = this.readData();
    const idx = items.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return null;

    const [deleted] = items.splice(idx, 1);
    this.writeData(items);
    return new this(this.modelName, deleted);
  }

  static async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }

  static async deleteMany(query = {}) {
    const items = this.readData();
    const remaining = items.filter(item => {
      for (const key in query) {
        if (item[key] === query[key]) {
          return false;
        }
      }
      return true;
    });
    this.writeData(remaining);
    return { deletedCount: items.length - remaining.length };
  }

  async save() {
    const items = this.constructor.readData();
    this.updatedAt = new Date().toISOString();
    
    // Find index of this item
    const idx = items.findIndex(item => String(item._id) === String(this._id));
    const serializable = { ...this };
    
    if (idx === -1) {
      items.push(serializable);
    } else {
      items[idx] = { ...items[idx], ...serializable };
    }
    
    this.constructor.writeData(items);
    return this;
  }
}

// Schema Builder Mock
const Schema = function(schemaDefinition, options) {
  this.definition = schemaDefinition;
  this.options = options;
};

Schema.prototype.pre = function(event, fn) {
  // Pass-through middleware hook register
};

Schema.prototype.methods = {};

// Root DB Export
module.exports = {
  connectDB,
  isMock: () => isMock,
  Schema: isMock ? Schema : mongoose.Schema,
  model: (name, schema) => {
    if (!isMock && mongoose) {
      return mongoose.model(name, schema);
    } else {
      // Return a dynamically specialized MockModel class
      const DynamicModel = class extends MockModel {
        constructor(mName, data) {
          super(mName || name, data);
        }
      };
      DynamicModel.initialize(name);
      return DynamicModel;
    }
  }
};

import React from 'react';

export default function DashboardCard({ title, value, icon, iconBg = 'bg-primary-subtle text-primary', subtitle, trend, trendColor = 'text-success' }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="text-muted fw-bold small text-uppercase tracking-wider">{title}</span>
          <div className={`rounded-circle d-flex align-items-center justify-content-center ${iconBg}`} style={{ width: '45px', height: '45px' }}>
            <i className={`${icon} fs-5`}></i>
          </div>
        </div>
        
        <div>
          <h2 className="display-6 fw-bold mb-1" style={{ letterSpacing: '-1px' }}>{value}</h2>
          
          {(subtitle || trend) && (
            <div className="d-flex align-items-center gap-1.5 pt-1">
              {trend && <span className={`${trendColor} fw-bold small me-1`}>{trend}</span>}
              {subtitle && <span className="text-muted small fw-semibold">{subtitle}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

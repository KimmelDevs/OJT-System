'use client';

export default function Card({ 
  children, 
  title, 
  action, 
  style = {}, 
  titleStyle = {},
  className = ''
}) {
  return (
    <div 
      className={`rounded-xl shadow-lg overflow-hidden ${className}`}
      style={{ 
        backgroundColor: '#2d2b26',
        border: '1px solid #3ae973',
        ...style 
      }}
    >
      {/* Card Header */}
      {(title || action) && (
        <div className="px-6 py-4 border-b" style={{ borderColor: '#3ae973' }}>
          <div className="flex items-center justify-between">
            {title && (
              <h3 
                className="text-xl font-semibold"
                style={{ color: '#fefffe', ...titleStyle }}
              >
                {title}
              </h3>
            )}
            {action && (
              <div className="flex items-center">
                {action}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Card Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
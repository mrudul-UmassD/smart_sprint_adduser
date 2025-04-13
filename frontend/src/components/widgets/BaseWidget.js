import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Settings, Close } from '@mui/icons-material';

const BaseWidget = ({ 
  title, 
  children, 
  onRemove, 
  onConfigure, 
  loading = false, 
  error = null 
}) => {
  return (
    <Card className="widget h-100 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center py-2">
        <h6 className="m-0 text-truncate">{title}</h6>
        <div className="widget-controls">
          {onConfigure && (
            <Button 
              variant="link" 
              className="p-0 me-2" 
              onClick={onConfigure}
              aria-label="Configure widget"
            >
              <Settings fontSize="small" />
            </Button>
          )}
          {onRemove && (
            <Button 
              variant="link" 
              className="p-0" 
              onClick={onRemove}
              aria-label="Remove widget"
            >
              <Close fontSize="small" />
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="p-3 widget-content">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-danger">
            <p className="mb-0">Error: {error}</p>
          </div>
        ) : (
          children
        )}
      </Card.Body>
    </Card>
  );
};

export default BaseWidget; 
import React from 'react';
import { getWidgetComponent, getWidgetDefaultConfig } from './WidgetRegistry';
import { Card } from 'react-bootstrap';

/**
 * WidgetRenderer - Renders a widget based on its type
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Widget type
 * @param {string} props.title - Widget title (optional, will use default if not provided)
 * @param {Object} props.config - Widget configuration
 * @param {function} props.onRemove - Function to call when widget is removed
 * @param {function} props.onConfigure - Function to call when widget is configured
 */
const WidgetRenderer = ({ type, title, config = {}, onRemove, onConfigure }) => {
  const WidgetComponent = getWidgetComponent(type);
  
  if (!WidgetComponent) {
    return (
      <Card className="widget h-100 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center py-2">
          <h6 className="m-0 text-truncate">{title || type}</h6>
        </Card.Header>
        <Card.Body className="p-3 widget-content d-flex align-items-center justify-content-center">
          <div className="text-center text-muted">
            <p>Widget type "{type}" is not available.</p>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Merge default config with provided config
  const defaultConfig = getWidgetDefaultConfig(type);
  const mergedConfig = { ...defaultConfig, ...config };
  
  return (
    <WidgetComponent
      title={title}
      config={mergedConfig}
      onRemove={onRemove}
      onConfigure={onConfigure}
    />
  );
};

export default WidgetRenderer; 
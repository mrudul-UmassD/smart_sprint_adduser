import React, { useState } from 'react';
import { Modal, Button, ListGroup, Form, InputGroup } from 'react-bootstrap';
import { getAvailableWidgets, WIDGET_METADATA, WIDGET_TYPES } from './WidgetRegistry';

const WidgetSelector = ({ show, onClose, onSelectWidget, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedWidgetType, setSelectedWidgetType] = useState(null);
  
  // Get available widgets for this role and filter by search term
  const getFilteredWidgets = () => {
    // Try to get widgets from getAvailableWidgets
    let widgets = [];
    try {
      widgets = getAvailableWidgets(userRole);
    } catch (error) {
      console.error('Error getting available widgets:', error);
      
      // Fallback to WIDGET_METADATA if available
      if (WIDGET_METADATA) {
        widgets = Object.keys(WIDGET_METADATA)
          .filter(key => {
            const metadata = WIDGET_METADATA[key];
            return metadata.roles && metadata.roles.includes(userRole);
          })
          .map(key => ({
            type: key,
            title: WIDGET_METADATA[key].title,
            description: WIDGET_METADATA[key].description,
            icon: WIDGET_METADATA[key].icon
          }));
      }
    }
    
    // Filter by search term if provided
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return widgets.filter(widget => 
        widget.title.toLowerCase().includes(term) || 
        (widget.description && widget.description.toLowerCase().includes(term))
      );
    }
    
    return widgets;
  };
  
  const handleSelectWidget = (widgetType) => {
    setSelectedWidgetType(widgetType);
    
    // Find widget info to set default title
    const widgetInfo = getFilteredWidgets().find(w => w.type === widgetType);
    if (widgetInfo) {
      setCustomTitle(widgetInfo.title);
    }
  };
  
  const handleAddWidget = () => {
    if (selectedWidgetType) {
      onSelectWidget(selectedWidgetType, customTitle);
      resetState();
    }
  };
  
  const resetState = () => {
    setSearchTerm('');
    setCustomTitle('');
    setSelectedWidgetType(null);
    onClose();
  };
  
  // Render header with search box
  const renderHeader = () => (
    <div className="mb-3">
      <Form.Group>
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Form.Group>
    </div>
  );
  
  // Render widget list
  const renderWidgetList = () => {
    const widgets = getFilteredWidgets();
    
    if (widgets.length === 0) {
      return (
        <div className="text-center p-3">
          <p className="text-muted">No widgets found matching your search</p>
        </div>
      );
    }
    
    return (
      <ListGroup>
        {widgets.map(widget => (
          <ListGroup.Item
            key={widget.type}
            action
            active={selectedWidgetType === widget.type}
            onClick={() => handleSelectWidget(widget.type)}
            className="d-flex align-items-center"
          >
            <div className="widget-icon me-3">
              {typeof widget.icon === 'string' ? (
                <i className={`bi ${widget.icon}`}></i>
              ) : (
                widget.icon
              )}
            </div>
            <div>
              <h6 className="mb-0">{widget.title}</h6>
              <small className="text-muted">{widget.description}</small>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };
  
  // Render custom title input for selected widget
  const renderCustomTitleInput = () => {
    if (!selectedWidgetType) return null;
    
    return (
      <Form.Group className="mt-3">
        <Form.Label>Widget Title</Form.Label>
        <Form.Control
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="Enter a custom title for the widget"
        />
      </Form.Group>
    );
  };
  
  return (
    <Modal show={show} onHide={resetState} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Widget</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderHeader()}
        {renderWidgetList()}
        {renderCustomTitleInput()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={resetState}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAddWidget}
          disabled={!selectedWidgetType}
        >
          Add Widget
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WidgetSelector; 
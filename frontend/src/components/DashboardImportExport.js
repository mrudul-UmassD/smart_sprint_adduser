import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { FiDownload, FiUpload } from 'react-icons/fi';

const DashboardImportExport = ({ show, onHide, currentConfig, onImport }) => {
  const [exportConfig, setExportConfig] = useState('');
  const [importConfig, setImportConfig] = useState('');
  const [importError, setImportError] = useState('');
  const [activeTab, setActiveTab] = useState('export');
  const [copied, setCopied] = useState(false);

  // Generate export configuration when modal opens
  React.useEffect(() => {
    if (show && currentConfig) {
      const configString = JSON.stringify(currentConfig, null, 2);
      setExportConfig(configString);
    }
  }, [show, currentConfig]);

  // Handle import of configuration
  const handleImport = () => {
    try {
      const parsedConfig = JSON.parse(importConfig);
      
      // Validate the imported configuration
      if (!parsedConfig.widgets || !Array.isArray(parsedConfig.widgets)) {
        throw new Error('Invalid configuration: Missing or invalid widgets array');
      }
      
      // Check if each widget has required properties
      parsedConfig.widgets.forEach((widget, index) => {
        if (!widget.id || !widget.type) {
          throw new Error(`Invalid widget at index ${index}: Missing id or type`);
        }
      });
      
      onImport(parsedConfig);
      setImportError('');
      onHide();
    } catch (error) {
      setImportError(`Failed to import configuration: ${error.message}`);
    }
  };

  // Copy export configuration to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportConfig).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Dashboard Import/Export</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="export" title={<span><FiDownload className="me-2" /> Export</span>}>
            <p className="text-muted mb-3">
              Copy the configuration below to save your dashboard layout and widgets. 
              You can use this to restore your dashboard later or share it with others.
            </p>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={10}
                value={exportConfig}
                readOnly
                className="font-monospace small"
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="primary" onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
          </Tab>
          <Tab eventKey="import" title={<span><FiUpload className="me-2" /> Import</span>}>
            <p className="text-muted mb-3">
              Paste a previously exported dashboard configuration to restore your dashboard layout and widgets.
              <strong className="text-warning ms-2">Warning: This will replace your current dashboard.</strong>
            </p>
            {importError && (
              <Alert variant="danger">{importError}</Alert>
            )}
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={10}
                value={importConfig}
                onChange={(e) => setImportConfig(e.target.value)}
                placeholder="Paste your dashboard configuration here..."
                className="font-monospace small"
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="primary" 
                onClick={handleImport}
                disabled={!importConfig.trim()}
              >
                Import Configuration
              </Button>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DashboardImportExport; 
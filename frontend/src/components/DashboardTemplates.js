import React from 'react';
import { Modal, Card, Row, Col, Button } from 'react-bootstrap';
import { 
  FaChartPie, 
  FaClipboardList, 
  FaChartLine, 
  FaUsers, 
  FaThLarge 
} from 'react-icons/fa';

const DashboardTemplates = ({ show, onHide, onApplyTemplate }) => {
  const templates = [
    {
      id: 'admin-full',
      name: 'Admin Dashboard',
      description: 'Complete dashboard with all widgets for administrators',
      icon: <FaThLarge />,
      layouts: {
        lg: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'myTasks-1', x: 6, y: 0, w: 6, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 8, w: 6, h: 7 },
          { i: 'teamPerformance-1', x: 6, y: 8, w: 6, h: 7 }
        ],
        md: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'myTasks-1', x: 6, y: 0, w: 6, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 8, w: 6, h: 7 },
          { i: 'teamPerformance-1', x: 6, y: 8, w: 6, h: 7 }
        ],
        sm: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 6, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 16, w: 6, h: 7 },
          { i: 'teamPerformance-1', x: 0, y: 23, w: 6, h: 7 }
        ],
        xs: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 4, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 4, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 16, w: 4, h: 7 },
          { i: 'teamPerformance-1', x: 0, y: 23, w: 4, h: 7 }
        ]
      },
      widgetConfigs: {
        'projectSummary-1': { type: 'projectSummary' },
        'myTasks-1': { type: 'myTasks', limit: 5 },
        'burndownChart-1': { type: 'burndownChart' },
        'teamPerformance-1': { type: 'teamPerformance' }
      }
    },
    {
      id: 'project-manager',
      name: 'Project Manager',
      description: 'Focused on project overview and task management',
      icon: <FaChartPie />,
      layouts: {
        lg: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'myTasks-1', x: 6, y: 0, w: 6, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 8, w: 12, h: 7 }
        ],
        md: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'myTasks-1', x: 6, y: 0, w: 6, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 8, w: 12, h: 7 }
        ],
        sm: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 6, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 16, w: 6, h: 7 }
        ],
        xs: [
          { i: 'projectSummary-1', x: 0, y: 0, w: 4, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 4, h: 8 },
          { i: 'burndownChart-1', x: 0, y: 16, w: 4, h: 7 }
        ]
      },
      widgetConfigs: {
        'projectSummary-1': { type: 'projectSummary' },
        'myTasks-1': { type: 'myTasks', limit: 5 },
        'burndownChart-1': { type: 'burndownChart' }
      }
    },
    {
      id: 'developer',
      name: 'Developer View',
      description: 'Focus on your tasks and project status',
      icon: <FaClipboardList />,
      layouts: {
        lg: [
          { i: 'myTasks-1', x: 0, y: 0, w: 12, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 8, w: 12, h: 7 }
        ],
        md: [
          { i: 'myTasks-1', x: 0, y: 0, w: 12, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 8, w: 12, h: 7 }
        ],
        sm: [
          { i: 'myTasks-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 8, w: 6, h: 7 }
        ],
        xs: [
          { i: 'myTasks-1', x: 0, y: 0, w: 4, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 8, w: 4, h: 7 }
        ]
      },
      widgetConfigs: {
        'myTasks-1': { type: 'myTasks', limit: 10 },
        'projectSummary-1': { type: 'projectSummary' }
      }
    },
    {
      id: 'analytics',
      name: 'Analytics Focus',
      description: 'Dashboard focused on data visualization and analytics',
      icon: <FaChartLine />,
      layouts: {
        lg: [
          { i: 'burndownChart-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'teamPerformance-1', x: 6, y: 0, w: 6, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 8, w: 12, h: 7 }
        ],
        md: [
          { i: 'burndownChart-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'teamPerformance-1', x: 6, y: 0, w: 6, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 8, w: 12, h: 7 }
        ],
        sm: [
          { i: 'burndownChart-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'teamPerformance-1', x: 0, y: 8, w: 6, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 16, w: 6, h: 7 }
        ],
        xs: [
          { i: 'burndownChart-1', x: 0, y: 0, w: 4, h: 8 },
          { i: 'teamPerformance-1', x: 0, y: 8, w: 4, h: 8 },
          { i: 'projectSummary-1', x: 0, y: 16, w: 4, h: 7 }
        ]
      },
      widgetConfigs: {
        'burndownChart-1': { type: 'burndownChart' },
        'teamPerformance-1': { type: 'teamPerformance' },
        'projectSummary-1': { type: 'projectSummary' }
      }
    },
    {
      id: 'team-focus',
      name: 'Team Focus',
      description: 'Dashboard focused on team performance and tasks',
      icon: <FaUsers />,
      layouts: {
        lg: [
          { i: 'teamPerformance-1', x: 0, y: 0, w: 12, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 6, h: 7 },
          { i: 'burndownChart-1', x: 6, y: 8, w: 6, h: 7 }
        ],
        md: [
          { i: 'teamPerformance-1', x: 0, y: 0, w: 12, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 6, h: 7 },
          { i: 'burndownChart-1', x: 6, y: 8, w: 6, h: 7 }
        ],
        sm: [
          { i: 'teamPerformance-1', x: 0, y: 0, w: 6, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 6, h: 7 },
          { i: 'burndownChart-1', x: 0, y: 15, w: 6, h: 7 }
        ],
        xs: [
          { i: 'teamPerformance-1', x: 0, y: 0, w: 4, h: 8 },
          { i: 'myTasks-1', x: 0, y: 8, w: 4, h: 7 },
          { i: 'burndownChart-1', x: 0, y: 15, w: 4, h: 7 }
        ]
      },
      widgetConfigs: {
        'teamPerformance-1': { type: 'teamPerformance' },
        'myTasks-1': { type: 'myTasks', limit: 5 },
        'burndownChart-1': { type: 'burndownChart' }
      }
    }
  ];

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Select Dashboard Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-4">
          Choose a template to quickly set up your dashboard. Your current layout will be replaced.
        </p>
        
        <Row xs={1} md={2} className="g-4">
          {templates.map(template => (
            <Col key={template.id}>
              <Card 
                className="h-100 dashboard-template" 
                onClick={() => onApplyTemplate(template)}
              >
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="template-icon me-3 fs-3 text-primary">
                      {template.icon}
                    </div>
                    <div>
                      <Card.Title className="mb-0">{template.name}</Card.Title>
                    </div>
                  </div>
                  <Card.Text>
                    {template.description}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-transparent">
                  <Button variant="outline-primary" size="sm" className="w-100">
                    Apply Template
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
      
      <style jsx>{`
        .dashboard-template {
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #dee2e6;
        }
        
        .dashboard-template:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #adb5bd;
        }
        
        .template-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: rgba(13, 110, 253, 0.1);
        }
      `}</style>
    </Modal>
  );
};

export default DashboardTemplates; 
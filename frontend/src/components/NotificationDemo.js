import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo 
} from '../utils/NotificationUtils';

/**
 * Demo component to showcase the notification system
 */
const NotificationDemo = () => {
  // Show a success notification
  const handleShowSuccess = () => {
    showSuccess('Operation completed successfully!');
  };

  // Show an error notification
  const handleShowError = () => {
    showError('An error occurred. Please try again.');
  };

  // Show a warning notification
  const handleShowWarning = () => {
    showWarning('This action might have consequences.');
  };

  // Show an info notification
  const handleShowInfo = () => {
    showInfo('This is for your information only.');
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">Notification System Demo</h2>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title>Center Notifications</Card.Title>
          <Card.Text>
            These notifications appear in the center of the screen and automatically 
            dismiss after 1.5 seconds. They're ideal for quick feedback to user actions.
          </Card.Text>
          
          <Row className="mt-4">
            <Col>
              <Button 
                variant="success" 
                className="w-100 mb-2"
                onClick={handleShowSuccess}
              >
                Show Success
              </Button>
            </Col>
            <Col>
              <Button 
                variant="danger" 
                className="w-100 mb-2"
                onClick={handleShowError}
              >
                Show Error
              </Button>
            </Col>
            <Col>
              <Button 
                variant="warning" 
                className="w-100 mb-2"
                onClick={handleShowWarning}
              >
                Show Warning
              </Button>
            </Col>
            <Col>
              <Button 
                variant="info" 
                className="w-100 mb-2"
                onClick={handleShowInfo}
              >
                Show Info
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="text-center">
          <Card.Title>Instructions</Card.Title>
          <Card.Text>
            Click on any button above to see the corresponding notification type.
            Each notification will appear in the center of the screen with a distinctive
            style and icon, and will automatically dismiss after 1.5 seconds.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotificationDemo; 
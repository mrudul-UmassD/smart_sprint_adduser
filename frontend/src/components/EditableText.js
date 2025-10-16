import React, { useState, useRef, useEffect } from 'react';
import { Form } from 'react-bootstrap';

/**
 * EditableText Component
 * 
 * A component that allows text to be edited inline.
 * When not in edit mode, it displays text normally.
 * When in edit mode, it displays an input field.
 * 
 * @param {string} text - The current text value
 * @param {function} onSave - Function called when text is saved
 * @param {boolean} isEditing - Whether the component is in edit mode
 * @param {function} onEditToggle - Function to toggle edit mode
 * @param {string} className - Additional CSS classes
 * @param {string} placeholder - Placeholder text for the input
 */
const EditableText = ({ 
  text, 
  onSave, 
  isEditing, 
  onEditToggle, 
  className = '', 
  placeholder = 'Enter text...' 
}) => {
  const [editText, setEditText] = useState(text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(editText);
      if (onEditToggle) onEditToggle();
    } else if (e.key === 'Escape') {
      setEditText(text);
      if (onEditToggle) onEditToggle();
    }
  };

  const handleBlur = () => {
    onSave(editText);
    if (onEditToggle) onEditToggle();
  };

  if (isEditing) {
    return (
      <Form.Control
        ref={inputRef}
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={className}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span 
      className={`editable-text ${className}`} 
      onClick={onEditToggle}
      title="Click to edit"
      style={{ cursor: 'pointer' }}
    >
      {text || placeholder}
    </span>
  );
};

export default EditableText; 
import { getWidgetMetadata } from '../widgets/WidgetRegistry';

/**
 * Utility functions to handle different dashboard layout modes
 */

/**
 * Convert widgets to grid layout format
 * @param {Array} widgets - Array of widgets
 * @returns {Array} Layout for grid mode
 */
export const convertToGridLayout = (widgets) => {
  return widgets.map(widget => widget.layout);
};

/**
 * Generate a list layout for widgets
 * 
 * Places widgets in a single column, stacked vertically
 * 
 * @param {Array} widgets - Array of widgets
 * @returns {Array} Layout for list mode
 */
export const generateListLayout = (widgets) => {
  return widgets.map((widget, index) => {
    const metadata = getWidgetMetadata(widget.type);
    const height = metadata?.defaultDimensions?.h || 6;
    
    return {
      i: widget.id,
      x: 0,
      y: index * height,
      w: 12,
      h: height
    };
  });
};

/**
 * Generate a compact layout for widgets
 * 
 * Places widgets in two columns, alternating left and right
 * 
 * @param {Array} widgets - Array of widgets
 * @returns {Array} Layout for compact mode
 */
export const generateCompactLayout = (widgets) => {
  let leftY = 0;
  let rightY = 0;
  
  return widgets.map((widget, index) => {
    const metadata = getWidgetMetadata(widget.type);
    const height = metadata?.defaultDimensions?.h || 6;
    const width = 6;
    
    // Alternate between left and right columns
    const isLeft = index % 2 === 0;
    const x = isLeft ? 0 : 6;
    
    // Calculate Y position based on current column height
    const y = isLeft ? leftY : rightY;
    
    // Update the column height
    if (isLeft) {
      leftY += height;
    } else {
      rightY += height;
    }
    
    return {
      i: widget.id,
      x,
      y,
      w: width,
      h: height
    };
  });
};

/**
 * Apply the specified layout mode to widgets
 * 
 * @param {string} mode - Layout mode ('Grid', 'List', 'Compact')
 * @param {Array} widgets - Array of widgets
 * @returns {Array} Layout based on the specified mode
 */
export const applyLayoutMode = (mode, widgets) => {
  switch (mode) {
    case 'List':
      return generateListLayout(widgets);
    case 'Compact':
      return generateCompactLayout(widgets);
    case 'Grid':
    default:
      return convertToGridLayout(widgets);
  }
};

/**
 * Update widgets with new layout positions
 * 
 * @param {Array} widgets - Original widgets array
 * @param {Array} newLayout - New layout positions
 * @returns {Array} Updated widgets with new layout positions
 */
export const updateWidgetsWithLayout = (widgets, newLayout) => {
  return widgets.map(widget => {
    const layoutItem = newLayout.find(item => item.i === widget.id);
    if (layoutItem) {
      return {
        ...widget,
        layout: layoutItem
      };
    }
    return widget;
  });
}; 
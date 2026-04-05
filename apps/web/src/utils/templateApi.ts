// src/utils/templateApi.ts
import { EmailBlock, CanvasStyle } from '../store/types';

// 1. The strict TypeScript Interface
export interface TemplatePayload {
  name: string;
  content: {
    blocks: EmailBlock[];
    canvasStyle: CanvasStyle;
  };
}


// 2. The Export Helper
export const saveTemplateToCloud = async (
  templateName: string, 
  currentState: any // Passing the full Redux email slice here
) => {
  try {
    // 🧹 CLEANUP: Extract ONLY the permanent data, ignoring undo history and UI state
    const cleanPayload: TemplatePayload = {
      name: templateName,
      content: {
        blocks: currentState.blocks,
        canvasStyle: currentState.canvasStyle,
      },
    };

    console.log("Saving to Supabase...", cleanPayload);

    // 🚀 FIRE: Send the clean JSON to your Next.js POST route
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanPayload),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error);

    return data.id; // Returns the new UUID from the database!
    
  } catch (error) {
    console.error("Failed to save template:", error);
    throw error;
  }
};
export const fetchTemplates = async () => {
  try {
    const response = await fetch('/api/templates');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch');
    }

    const data = await response.json();
    return data; // This returns the array of templates from Supabase
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};
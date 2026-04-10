
/**
 * 1. FETCH TEMPLATES via Next API
 */
export const fetchTemplates = async (type: 'project' | 'template') => {
  const response = await fetch(`/api/templates?type=${type}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch templates');
  }
  return response.json();
};

/**
 * 2. SAVE TEMPLATE TO CLOUD via Next API
 */
export const saveTemplateToCloud = async (name: string, content: any, isProject: boolean = true) => {
  const response = await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      content,
      is_project: isProject,
      is_template: !isProject
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save template');
  }

  const data = await response.json();
  return data.id;
};
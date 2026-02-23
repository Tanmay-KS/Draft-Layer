'use client';

import { useAppDispatch } from '../../store/hooks';
import { addBlock } from '../../store/emailSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();

  const handleAddBlock = (type: 'text' | 'image' | 'button') => {
    dispatch(
      addBlock({
        id: Date.now().toString(),
        type,

        layout: {
          colStart: 1,
          colSpan: 6,
          rowStart: 1,
          rowSpan: 6,
        },

        content: {
          value: `${type} block`,
        },
      })
    );
  };

  return (
    <div
      style={{
        width: '250px',
        borderRight: '1px solid #ddd',
        padding: '20px',
      }}
    >
      <h3>Blocks</h3>

      <button onClick={() => handleAddBlock('text')}>
        Add Text Block
      </button>

      <br /><br />

      <button onClick={() => handleAddBlock('image')}>
        Add Image Block
      </button>

      <br /><br />

      <button onClick={() => handleAddBlock('button')}>
        Add Button Block
      </button>
    </div>
  );
}

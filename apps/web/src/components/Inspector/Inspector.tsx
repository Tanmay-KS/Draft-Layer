'use client';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateBlockContent, updateBlockWidth,updateBlockPosition,updateBlockHeight  } from '../../store/emailSlice';

export default function Inspector() {
  const dispatch = useAppDispatch();
  const { blocks, selectedBlockId } = useAppSelector(
    (state) => state.email
  );

  const selectedBlock = blocks.find(
    (block) => block.id === selectedBlockId
  );

  if (!selectedBlock) {
    return (
      <div
        style={{
          width: '300px',
          borderLeft: '1px solid #ddd',
          padding: '20px',
        }}
      >
        <h3>Inspector</h3>
        <p>No block selected</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '300px',
        borderLeft: '1px solid #ddd',
        padding: '20px',
      }}
    >
      <h3>Inspector</h3>

      <p><strong>Type:</strong> {selectedBlock.type}</p>

      <textarea
        value={selectedBlock.content.value}
        onChange={(e) =>
          dispatch(
            updateBlockContent({
              id: selectedBlock.id,
              content: e.target.value,
            })
          )
        }
        style={{
          width: '100%',
          marginTop: '10px',
        }}
      />
      
      <p style={{ marginTop: '15px' }}>Width (1–48)</p>
      <input
        type="range"
        min={1}
        max={48}
        value={selectedBlock.layout.colSpan}
        onChange={(e) =>
          dispatch(
            updateBlockWidth({
              id: selectedBlock.id,
              colSpan: Number(e.target.value),
            })
          )
        }
      />

      <p style={{ marginTop: '15px' }}>Column Start (1–24)</p>
      <input
        type="number"
        min={1}
        max={24}
        value={selectedBlock.layout.colStart}
        onChange={(e) =>
          dispatch(
            updateBlockPosition({
              id: selectedBlock.id,
              colStart: Number(e.target.value),
              rowStart: selectedBlock.layout.rowStart,
            })
          )
        }
      />

      <p style={{ marginTop: '15px' }}>Row Start</p>
      <input
        type="number"
        min={1}
        value={selectedBlock.layout.rowStart}
        onChange={(e) =>
          dispatch(
            updateBlockPosition({
              id: selectedBlock.id,
              colStart: selectedBlock.layout.colStart,
              rowStart: Number(e.target.value),
            })
          )
        }
      />
      <p style={{ marginTop: '15px' }}>Height (Row Span)</p>
      <input
        type="number"
        min={1}
        value={selectedBlock.layout.rowSpan}
        onChange={(e) =>
          dispatch(
            updateBlockHeight({
              id: selectedBlock.id,
              rowSpan: Number(e.target.value),
            })
          )
        }
      />
      <p>{selectedBlock.layout.colSpan} / 48</p>
    </div>
  );
}

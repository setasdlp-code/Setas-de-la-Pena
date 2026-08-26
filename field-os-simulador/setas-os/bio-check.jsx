import React, {useState, useEffect} from 'react';
import {loadBioCheck, saveBioCheck} from './utils/storage.js';

// Define checklist items – can be adjusted later.
const DEFAULT_ITEMS = [
  {id: 'desinfectar', label: 'Desinfectar superficies', comment: ''},
  {id: 'ppe', label: 'Usar PPE', comment: ''},
  {id: 'temperatura', label: 'Medir temperatura', comment: ''},
];

export default function BioCheck() {
  const [items, setItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadBioCheck();
    if (saved && saved.items && saved.items.length) {
      setItems(saved.items);
    } else {
      // initialize with defaults
      setItems(DEFAULT_ITEMS.map(i => ({...i, checked: false})));
    }
  }, []);

  // Update badge when all required items are checked
  useEffect(() => {
    const ok = items.every(i => i.checked);
    setAllChecked(ok);
    // persist
    saveBioCheck({items});
  }, [items]);

  const toggleItem = id => {
    setItems(prev =>
      prev.map(i => (i.id === id ? {...i, checked: !i.checked} : i))
    );
  };

  const setComment = (id, comment) => {
    setItems(prev =>
      prev.map(i => (i.id === id ? {...i, comment} : i))
    );
  };

  return (
    <div className="bio-check">
      <h2>Checklist Digital de Bioseguridad</h2>
      {allChecked && <div className="badge">✅ Bio‑Check OK</div>}
      <ul>
        {items.map(item => (
          <li key={item.id} style={{marginBottom: '0.5rem'}}>
            <label>
              <input
                type="checkbox"
                checked={!!item.checked}
                onChange={() => toggleItem(item.id)}
              />{' '}
              {item.label}
            </label>
            <br />
            <textarea
              placeholder="Comentario opcional"
              value={item.comment || ''}
              onChange={e => setComment(item.id, e.target.value)}
              rows={2}
              style={{width: '100%'}}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

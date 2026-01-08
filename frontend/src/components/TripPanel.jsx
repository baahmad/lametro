import { useState } from 'react';
import './TripPanel.css';

function TripPanel() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`trip-panel ${isOpen ? 'open' : 'closed'}`}>
            <button 
                className="toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '◀' : '▶'}
            </button>
            
            {isOpen && (
                <div className="panel-content">
                    <h2>TODO: Add Panel content</h2>
                    {/* Content will go here */}
                </div>
            )}
        </div>
    );
}

export default TripPanel;
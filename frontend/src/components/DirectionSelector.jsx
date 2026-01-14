import railLines from '../data/railLines.json';

/**
 * Component for selecting train direction (Northbound/Southbound or Eastbound/Westbound).
 * @param {string} selectedLine - The currently selected rail line route ID.
 * @param {Array} availableLines - Array of available line/direction combinations.
 * @param {string} selectedDirection - The currently selected direction ID.
 * @param {function} onDirectionChange - Callback when direction selection changes.
 */
function DirectionSelector({ selectedLine, availableLines, selectedDirection, onDirectionChange }) {
    const route = railLines.features.find(f => f.properties.route_id === selectedLine);
    const directionType = route?.properties.directionType || 'north-south';
    const invert = route?.properties.invertDirections;

    // Sort directions so Northbound/Eastbound (effectiveDirection=0) comes first.
    const sortedLines = availableLines
        .filter(l => l.route_id === selectedLine)
        .sort((a, b) => {
            const effA = invert ? (1 - a.direction_id) : a.direction_id;
            const effB = invert ? (1 - b.direction_id) : b.direction_id;
            return effA - effB;
        });

    return (
        <div className="direction-selector">
            <label>Direction</label>
            <div className="direction-toggle">
                {sortedLines.map(line => {
                    const effectiveDirection = invert ? (1 - line.direction_id) : line.direction_id;
                    const directionLabel = directionType === 'north-south'
                        ? (effectiveDirection === 1 ? 'Southbound' : 'Northbound')
                        : (effectiveDirection === 1 ? 'Westbound' : 'Eastbound');
                    return (
                        <button
                            key={line.direction_id}
                            className={`direction-btn ${selectedDirection === String(line.direction_id) ? 'selected' : ''}`}
                            onClick={() => onDirectionChange(String(line.direction_id))}
                        >
                            {directionLabel}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default DirectionSelector;

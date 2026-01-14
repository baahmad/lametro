import './AboutModal.css';

/**
 * Modal component displaying information about the LA Metro Tracker app.
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {function} onClose - Callback to close the modal.
 */
function AboutModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="about-overlay" onClick={onClose}>
            <div className="about-modal" onClick={(e) => e.stopPropagation()}>
                <button className="about-close" onClick={onClose}>✕</button>
                <h2>LA Metro Train Tracker</h2>
                <p>Real-time train tracking for LA Metro rail lines.</p>

                <div className="about-section">
                    <h3>Links</h3>
                    <a href="https://github.com/baahmad/lametro" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                </div>

                <div className="about-section">
                    <h3>Data Sources</h3>
                    <p>Real-time data from LA Metro via Swiftly</p>
                </div>

                <div className="about-section">
                    <h3>Map Attribution</h3>
                    <p>Map tiles by CARTO, map data by OpenStreetMap contributors</p>
                </div>
            </div>
        </div>
    );
}

export default AboutModal;

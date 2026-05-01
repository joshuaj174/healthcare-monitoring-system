const AlertBox = ({ alerts }) => {
  return (
    <div>
      <h6 className="text-warning mb-3">Live Alerts</h6>
      {alerts.length === 0 ? (
        <p className="text-secondary small">No alerts at this time.</p>
      ) : (
        alerts.map((alert, i) => (
          <div key={i} className="alert-item">
            <div>{alert.message}</div>
            <small className="text-secondary">{new Date(alert.timestamp).toLocaleTimeString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default AlertBox;
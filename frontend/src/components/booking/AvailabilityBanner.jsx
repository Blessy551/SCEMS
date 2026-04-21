const AvailabilityBanner = ({ result }) => {
  if (!result) return null;
  const available = result.available;
  return (
    <div
      className="card"
      style={{
        background: available ? 'var(--color-approved-bg)' : 'var(--color-pending-bg)',
        color: available ? 'var(--color-approved-text)' : 'var(--color-pending-text)',
        padding: 14
      }}
    >
      {available ? 'Slot is available.' : 'Slot has a booking or blocked-slot conflict.'}
    </div>
  );
};

export default AvailabilityBanner;

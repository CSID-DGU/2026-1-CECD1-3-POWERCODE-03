type ProfileFieldProps = {
  label: string;
  value: string;
};

export const ProfileField = ({ label, value }: ProfileFieldProps) => (
  <div className="settings-profile-field">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

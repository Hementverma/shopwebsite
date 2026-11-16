import { Link } from 'react-router-dom';
import { FiBox } from 'react-icons/fi';

export default function EmptyState({ icon, title, description, actionText, actionPath }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-cream border border-navy-100 flex items-center justify-center text-navy-300 mb-5">
        {icon || <FiBox size={36} strokeWidth={1.3} />}
      </div>
      <h3 className="font-display text-xl font-bold text-ink mb-2">{title}</h3>
      <p className="text-muted mb-6 max-w-md text-sm">{description}</p>
      {actionText && actionPath && (
        <Link to={actionPath} className="btn-primary">{actionText}</Link>
      )}
    </div>
  );
}

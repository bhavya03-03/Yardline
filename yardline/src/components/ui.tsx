'use client';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { X, LoaderCircle } from 'lucide-react';
export function Button({
  children,
  variant = 'primary',
  busy = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  busy?: boolean;
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      {...props}
      disabled={props.disabled || busy}
    >
      {busy ? <LoaderCircle size={16} className="spin" /> : null}
      {children}
    </button>
  );
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Empty({
  icon,
  heading,
  children,
}: {
  icon?: ReactNode;
  heading: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon}
      <strong>{heading}</strong>
      <p>{children}</p>
    </div>
  );
}
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const control = isValidElement<{ id?: string; 'aria-describedby'?: string }>(children)
    ? children
    : null;
  const controlId = control?.props.id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={controlId}>{label}</label>
      {control
        ? cloneElement(control, {
            id: controlId,
            'aria-describedby': hint ? `${controlId}-hint` : control.props['aria-describedby'],
          })
        : children}
      {hint ? <small id={`${controlId}-hint`}>{hint}</small> : null}
    </div>
  );
}
export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-head">
        <div>
          <h2 id="modal-title">{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function time(value: string | null | undefined, compact = false) {
  if (!value) return 'Not yet verified';
  return new Intl.DateTimeFormat(
    'en-GB',
    compact
      ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  ).format(new Date(value));
}
export function relative(value: string | null | undefined) {
  if (!value) return 'Unverified';
  const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3600000));
  return hours < 1
    ? 'Less than an hour ago'
    : hours < 24
      ? `${hours}h ago`
      : `${Math.floor(hours / 24)}d ago`;
}

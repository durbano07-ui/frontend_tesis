import { DOMINIOS_INSTITUCIONALES } from '../utils/correoInstitucional';

/** Selector del dominio institucional que acompaña al campo de usuario del correo. */
const DominioCorreoSelect = ({ value, onChange, className, style, id, ariaLabel = 'Dominio del correo institucional' }) => (
    <select
        id={id}
        className={className}
        style={{ cursor: 'pointer', flexShrink: 0, width: 'auto', minHeight: 0, ...style }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
    >
        {DOMINIOS_INSTITUCIONALES.map(d => (
            <option key={d} value={d}>@{d}</option>
        ))}
    </select>
);

export default DominioCorreoSelect;

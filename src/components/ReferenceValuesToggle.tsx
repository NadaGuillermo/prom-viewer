interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const ReferenceValuesToggle = ({
  checked,
  onChange,
  label = "Show reference values",
}: Props) => {
  return (
    <label className="tw:flex tw:items-center tw:gap-2 tw:ml-8 tw:text-sm tw:text-base-content tw:cursor-pointer tw:w-fit">
      <input
        type="checkbox"
        className="tw:toggle tw:toggle-sm tw:toggle-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
};

export default ReferenceValuesToggle;

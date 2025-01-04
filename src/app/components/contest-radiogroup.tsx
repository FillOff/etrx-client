export interface Option {
    label: string;
    value: any;
}

interface RadioGroupProps {
    title: string;
    options: Option[];
    name: string;
    value: any;
    onChange: any;
}

export function RadioGroup (props: RadioGroupProps) {
    return (
        <div className='m-auto rounded-md h-fit px-4 py-2 w-fit bg-background-shade' role="radiogroup">
            <div>{props.title}</div>
            {props.options.map((option) => (
                <label key={option.value} style={{ display: 'block', margin: '5px 0' }}>
                    <input
                        type="radio"
                        name={props.name}
                        value={option.value}
                        checked={props.value == option.value}
                        onChange={(event) => props.onChange(event.target.value)}
                        style={{ margin: '0 5px 0 0'}}
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
};
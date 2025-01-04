export interface Option {
    label: string;
    value: number;
}

interface RadioGroupProps {
    title: string;
    options: Option[];
    name: string;
    value: number;
    onChange: any;
}

export function RadioGroup (props: RadioGroupProps) {
    return (
        <div className='m-auto rounded-md h-fit px-4 py-2 lg:w-[200px] w-[140px] bg-background-shade' role="radiogroup">
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
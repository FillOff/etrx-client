import Styles from "./problem-tags.module.css";


export function GetDivTagsList(tagsList: string[])
{
    return (
        <div>
            {tagsList.map((tag, i) => (
                <div key={i} className={Styles.tag}>{tag}</div>
            ))}
        </div>
    );
}
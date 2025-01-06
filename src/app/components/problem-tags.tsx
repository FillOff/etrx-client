import Styles from "./problem-tags.module.css";


export function GetDivTagsList(tagsList: string[])
{
    return (
        <div>
            {tagsList.map((tag) => (
                <div key={tag} className={Styles.tag}>{tag}</div>
            ))}
        </div>
    );
}
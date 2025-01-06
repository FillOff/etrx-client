import { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./tags-filter.module.css"

export function TagsFilter
(
    {
        getTags,
        selTags,
        onChange
    }:
    {
        getTags: () => Promise<{tags: string[]}>,
        selTags: string[]
        onChange: any
    }
)
{
    const [tags, setTags] = useState<string[]>([]);
    const firstUpdate = useRef(true);

    function request()
    {
        if(firstUpdate.current)
        {
            getTags().then(result => {
                if(result.tags.length != 0)
                    setTags(result.tags);
            });
            firstUpdate.current = false;
        }
    }
    
    useEffect(() => {
        request();
    }, [getTags])

    const divTags = useMemo(() => {
        return (
            <div className={Styles.all_tags}>
                {tags.map((tag) => (
                    <div 
                        key={tag} 
                        className={Styles.tag}
                        onClick={() => {
                            setTags(tags.filter(t => t != tag));
                            onChange([...selTags, tag]);
                        }}>
                        {tag}
                    </div>
                ))}
            </div>
        )
    }, [tags]);

    const divSelectedTags = useMemo(() => {
        return (
            <>
                <div className={Styles.selected_tags}>
                    {selTags.map((tag) => (
                        <div 
                            key={`${tag}1`}
                            className={Styles.tag}
                            onClick={() => {
                                onChange(selTags.filter(t => t != tag));
                                setTags([...tags, tag]);
                            }}>
                            {tag}
                        </div>
                    ))}
                </div>
            </>
        )
    }, [selTags]);

    return (
        <div className={Styles.container}>
            <div className={Styles.main}>
                <div>Filter tags</div>
                {divSelectedTags}
                {divTags}
            </div>
        </div>
    )
}
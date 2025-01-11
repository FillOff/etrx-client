import { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./tags-filter.module.css"
import { Widget } from "./widget";

export function TagsFilter
(
    {
        getTags,
        selTags,
        onChangeTags,
        getIndexes,
        selIndexes,
        onChangeIndexes
    }:
    {
        getTags: () => Promise<{tags: string[]}>,
        selTags: string[],
        onChangeTags: any,
        getIndexes: () => Promise<{indexes: string[]}>,
        selIndexes: string[],
        onChangeIndexes: any
    }
)
{
    const [tags, setTags] = useState<string[]>([]);
    const [indexes, setIndexes] = useState<string[]>([]);
    const firstUpdate = useRef(true);

    function request()
    {
        if(firstUpdate.current)
        {
            getTags().then(result => {
                if(result.tags.length != 0)
                    setTags(result.tags);
            });

            getIndexes().then(result => {
                if(result.indexes.length != 0)
                    setIndexes(result.indexes);
            });

            firstUpdate.current = false;
        }
    }
    
    useEffect(() => {
        request();
    }, [getTags, getIndexes])

    const divTags = useMemo(() => {
        return (
            <div>
                {tags.map((tag) => (
                    <div 
                        key={tag} 
                        className={Styles.tag}
                        onClick={() => {
                            setTags(tags.filter(t => t != tag));
                            onChangeTags([...selTags, tag]);
                        }}>
                        {tag}
                    </div>
                ))}
            </div>
        )
    }, [tags]);

    const divIndexes = useMemo(() => {
        return (
            <div>
                {indexes.map((index) => (
                    <div 
                        key={index} 
                        className={Styles.tag}
                        onClick={() => {
                            setIndexes(indexes.filter(t => t != index));
                            onChangeIndexes([...selIndexes, index]);
                        }}>
                        {index}
                    </div>
                ))}
            </div>
        )
    }, [indexes]);

    const divSelectedTags = useMemo(() => {
        return (
            <>
                <div>
                    {selTags.map((tag) => (
                        <div 
                            key={`${tag}1`}
                            className={Styles.tag}
                            onClick={() => {
                                onChangeTags(selTags.filter(t => t != tag));
                                setTags([...tags, tag]);
                            }}>
                            {tag}
                        </div>
                    ))}
                </div>
            </>
        )
    }, [selTags]);

    const divSelectedIndexes = useMemo(() => {
        return (
            <>
                <div>
                    {selIndexes.map((index) => (
                        <div 
                            key={`${index}1`}
                            className={Styles.tag}
                            onClick={() => {
                                onChangeIndexes(selIndexes.filter(i => i != index));
                                setIndexes([...indexes, index]);
                            }}>
                            {index}
                        </div>
                    ))}
                </div>
            </>
        )
    }, [selIndexes]);

    return (
        <div className={Styles.container}>
            <div className={Styles.main}>
                <div>Filter tags</div>
                <div className={Styles.selected_tags}>
                    {divSelectedTags}
                    {divSelectedIndexes}
                </div>
                <Widget 
                    title="Теги"
                    data={divTags}
                />
                <Widget 
                    title="Индексы"
                    data={divIndexes}
                />
            </div>
        </div>
    )
}
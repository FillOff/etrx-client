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
        onChangeIndexes,
        problemName,
        onChangeProblemName
    }:
    {
        getTags: () => Promise<{tags: string[]}>,
        selTags: string[],
        onChangeTags: any,
        getIndexes: () => Promise<{indexes: string[]}>,
        selIndexes: string[],
        onChangeIndexes: any,
        problemName: string,
        onChangeProblemName: any
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
        if (selTags.length != 0)
        {
            return (
                <fieldset className={Styles.fieldset}>
                    <legend className={Styles.legend}>Теги</legend>
                    {selTags.map((tag) => (
                        <div 
                            key={`${tag}1`}
                            className={Styles.tag}
                            onClick={() => {
                                onChangeTags(selTags.filter(t => t != tag));
                                setTags([...tags, tag]);
                            }}>
                            {tag}
                            <div className={Styles.close_btn}></div>
                        </div>
                    ))}
                </fieldset>
            )
        }
    }, [selTags]);

    const divSelectedIndexes = useMemo(() => {
        if (selIndexes.length != 0)
        {
            return (
                <fieldset className={Styles.fieldset}>
                    <legend className={Styles.legend}>Индексы</legend>
                    {selIndexes.map((index) => (
                        <div 
                            key={`${index}1`}
                            className={Styles.tag}
                            onClick={() => {
                                onChangeIndexes(selIndexes.filter(i => i != index));
                                setIndexes([...indexes, index]);
                            }}>
                            {index}
                            <div className={Styles.close_btn}></div>
                        </div>
                    ))}
                </fieldset>
            )
        }
    }, [selIndexes]);

    const searchForm =
        <div>
            <label htmlFor="problemName">Название задачи: </label>
            <input 
                type="text" 
                name="problemName" 
                id="problemName" 
                value={problemName} 
                onChange={(event) => {
                    onChangeProblemName(event.target.value);
                }} 
                className="border-[1.5px] border-solid border-black rounded-[6px] pl-[5px] pr-[5px] pt-[2px] pb-[2px]"/>
        </div>

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
                <Widget 
                    title="Поиск"
                    data={searchForm}
                />
            </div>
        </div>
    )
}
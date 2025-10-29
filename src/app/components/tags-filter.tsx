import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { getTags, getIndexes } from '@/app/services/problems';
import Styles from './tags-filter.module.css';
import { Widget } from './widget';

interface TagsFilterProps {
    selectedTags: string[];
    onSelectedTagsChange: (tags: string[]) => void;
    selectedIndexes: string[];
    onSelectedIndexesChange: (indexes: string[]) => void;
    problemName: string;
    onProblemNameChange: (name: string) => void;
    minRating: number;
    onMinRatingChange: (rating: number) => void;
    maxRating: number;
    onMaxRatingChange: (rating: number) => void;
    minPoints: number;
    onMinPointsChange: (points: number) => void;
    maxPoints: number;
    onMaxPointsChange: (points: number) => void;
}

export function TagsFilter({
    selectedTags,
    onSelectedTagsChange,
    selectedIndexes,
    onSelectedIndexesChange,
    problemName,
    onProblemNameChange,
    minRating,
    onMinRatingChange,
    maxRating,
    onMaxRatingChange,
    minPoints,
    onMinPointsChange,
    maxPoints,
    onMaxPointsChange,
}: TagsFilterProps) {
    const { t } = useTranslation('problem');

    const [allTags, setAllTags] = useState<string[]>([]);
    const [allIndexes, setAllIndexes] = useState<string[]>([]);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const tagsResponse = await getTags({ minRating, maxRating });
                const tagsData = await tagsResponse.json();
                setAllTags(tagsData);

                const indexesResponse = await getIndexes();
                const indexesData = await indexesResponse.json();
                setAllIndexes(indexesData);
            } catch (error) {
                console.error('Failed to load filter options:', error);
            }
        };
        fetchFilterOptions();
    }, [minRating, maxRating]);

    const handleSelectTag = (tag: string) => onSelectedTagsChange([...selectedTags, tag]);
    const handleDeselectTag = (tag: string) => onSelectedTagsChange(selectedTags.filter(t => t !== tag));
    const handleSelectIndex = (index: string) => onSelectedIndexesChange([...selectedIndexes, index]);
    const handleDeselectIndex = (index: string) => onSelectedIndexesChange(selectedIndexes.filter(i => i !== index));

    const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>, setter: (value: number) => void) => {
        const value = event.target.value;
        setter(value === '' ? 0 : parseInt(value, 10));
    };

    const availableTags = allTags.filter(tag => !selectedTags.includes(tag));
    const availableIndexes = allIndexes.filter(index => !selectedIndexes.includes(index));

    return (
        <div className={Styles.container}>
            <div className={Styles.main}>
                <div className="text-center">{t('filtersTitle')}</div>

                <div className={Styles.selected_tags}>
                    {selectedTags.length > 0 && (
                        <fieldset className={Styles.fieldset}>
                            <legend className={Styles.legend}>{t('filters.tags')}</legend>
                            {selectedTags.map(tag => (
                                <div key={tag} className={Styles.tag} onClick={() => handleDeselectTag(tag)}>
                                    {tag}
                                    <div className={Styles.close_btn}></div>
                                </div>
                            ))}
                        </fieldset>
                    )}
                    {selectedIndexes.length > 0 && (
                        <fieldset className={Styles.fieldset}>
                            <legend className={Styles.legend}>{t('filters.indexes')}</legend>
                            {selectedIndexes.map(index => (
                                <div key={index} className={Styles.tag} onClick={() => handleDeselectIndex(index)}>
                                    {index}
                                    <div className={Styles.close_btn}></div>
                                </div>
                            ))}
                        </fieldset>
                    )}
                </div>

                <Widget
                    title={t('widgetTitles.tags')}
                    data={
                        <div>
                            {availableTags.map(tag => (
                                <div key={tag} className={Styles.tag} onClick={() => handleSelectTag(tag)}>
                                    {tag}
                                </div>
                            ))}
                        </div>
                    }
                />
                <Widget
                    title={t('widgetTitles.indexes')}
                    data={
                        <div>
                            {availableIndexes.map(index => (
                                <div key={index} className={Styles.tag} onClick={() => handleSelectIndex(index)}>
                                    {index}
                                </div>
                            ))}
                        </div>
                    }
                />

                <Widget
                    title={t('widgetTitles.search')}
                    data={
                        <div>
                            <label htmlFor="problemName">{t('filters.problemName')}: </label>
                            <input
                                type="text"
                                name="problemName"
                                value={problemName}
                                onChange={e => onProblemNameChange(e.target.value)}
                                className={Styles.input}
                            />
                        </div>
                    }
                />

                <div className="flex flex-row w-full">
                    <div className="flex-1 mr-2">
                        <Widget
                            title={t('widgetTitles.ratingSort')}
                            data={
                                <div>
                                    <label htmlFor="minRating">{t('filters.min')}: </label>
                                    <input
                                        type="number"
                                        name="minRating"
                                        value={minRating || ''}
                                        onChange={e => handleNumberInputChange(e, onMinRatingChange)}
                                        className={Styles.input}
                                    />
                                    <br />
                                    <label htmlFor="maxRating">{t('filters.max')}: </label>
                                    <input
                                        type="number"
                                        name="maxRating"
                                        value={maxRating || ''}
                                        onChange={e => handleNumberInputChange(e, onMaxRatingChange)}
                                        className={Styles.input}
                                    />
                                </div>
                            }
                        />
                    </div>
                    <div className="flex-1">
                        <Widget
                            title={t('widgetTitles.pointsSort')}
                            data={
                                <div>
                                    <label htmlFor="minPoints">{t('filters.min')}: </label>
                                    <input
                                        type="number"
                                        name="minPoints"
                                        value={minPoints || ''}
                                        onChange={e => handleNumberInputChange(e, onMinPointsChange)}
                                        className={Styles.input}
                                    />
                                    <br />
                                    <label htmlFor="maxPoints">{t('filters.max')}: </label>
                                    <input
                                        type="number"
                                        name="maxPoints"
                                        value={maxPoints || ''}
                                        onChange={e => handleNumberInputChange(e, onMaxPointsChange)}
                                        className={Styles.input}
                                    />
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

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

  selectedDivisions: string[];
  onSelectedDivisionsChange: (divisions: string[]) => void;

  problemName: string;
  onProblemNameChange: (name: string) => void;

  minRating: number;
  onMinRatingChange: (rating: number, syncMax?: boolean) => void;
  maxRating: number;
  onMaxRatingChange: (rating: number) => void;

  minPoints: number;
  onMinPointsChange: (points: number) => void;
  maxPoints: number;
  onMaxPointsChange: (points: number) => void;

  minDifficulty: number;
  onMinDifficultyChange: (difficulty: number) => void;
  maxDifficulty: number;
  onMaxDifficultyChange: (difficulty: number) => void;
}

export function TagsFilter({
  selectedTags,
  onSelectedTagsChange,
  selectedIndexes,
  onSelectedIndexesChange,
  selectedDivisions,
  onSelectedDivisionsChange,
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
  minDifficulty,
  onMinDifficultyChange,
  maxDifficulty,
  onMaxDifficultyChange,
}: TagsFilterProps) {
  const { t } = useTranslation('problem');

  const [allTags, setAllTags] = useState<string[]>([]);
  const [allIndexes, setAllIndexes] = useState<string[]>([]);
  const allDivisions: string[] = ["Div1", "Div2", "Div3", "Div4"];

  const [draftMinRating, setDraftMinRating] = useState(minRating.toString());
  const [draftMaxRating, setDraftMaxRating] = useState(maxRating.toString());
  const [draftMinPoints, setDraftMinPoints] = useState(minPoints.toString());
  const [draftMaxPoints, setDraftMaxPoints] = useState(maxPoints.toString());
  const [draftMinDifficulty, setDraftMinDifficulty] = useState(minDifficulty.toString());
  const [draftMaxDifficulty, setDraftMaxDifficulty] = useState(maxDifficulty.toString());

  useEffect(() => { setDraftMinRating(minRating.toString()); }, [minRating]);
  useEffect(() => { setDraftMaxRating(maxRating.toString()); }, [maxRating]);
  useEffect(() => { setDraftMinPoints(minPoints.toString()); }, [minPoints]);
  useEffect(() => { setDraftMaxPoints(maxPoints.toString()); }, [maxPoints]);
  useEffect(() => { setDraftMinDifficulty(minDifficulty.toString()); }, [minDifficulty]);
  useEffect(() => { setDraftMaxDifficulty(maxDifficulty.toString()); }, [maxDifficulty]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const tagsResponse = await getTags({ minRating, maxRating });
        const tagsData: string[] = await tagsResponse.json();
        setAllTags(tagsData);

        const indexesResponse = await getIndexes();
        const indexesData: string[] = await indexesResponse.json();
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
  const handleSelectDivision = (division: string) => onSelectedDivisionsChange([...selectedDivisions, division]);
  const handleDeselectDivision = (division: string) => onSelectedDivisionsChange(selectedDivisions.filter(d => d !== division));

  const parseDraftInt = (s: string): number | null => {
    const trimmed = s.trim();
    if (trimmed === '') return null;
    const n = parseInt(trimmed, 10);
    return Number.isNaN(n) ? null : n;
  };

  const commitMinRating = () => {
    const min = parseDraftInt(draftMinRating);
    if (min === null) return;
    onMinRatingChange(min, true);      
    setDraftMaxRating(min.toString());
  };
  const commitMaxRating = () => {
    const max = parseDraftInt(draftMaxRating);
    if (max === null) return;
    onMaxRatingChange(max);
  };
  const commitMinPoints = () => {
    const val = parseDraftInt(draftMinPoints);
    if (val === null) return;
    onMinPointsChange(val);
  };
  const commitMaxPoints = () => {
    const val = parseDraftInt(draftMaxPoints);
    if (val === null) return;
    onMaxPointsChange(val);
  };
  const commitMinDifficulty = () => {
    const val = parseDraftInt(draftMinDifficulty);
    if (val === null) return;
    onMinDifficultyChange(val);
  };
  const commitMaxDifficulty = () => {
    const val = parseDraftInt(draftMaxDifficulty);
    if (val === null) return;
    onMaxDifficultyChange(val);
  };

  const availableTags = allTags.filter(tag => !selectedTags.includes(tag));
  const availableIndexes = allIndexes.filter(index => !selectedIndexes.includes(index));
  const availableDivisions = allDivisions.filter(d => !selectedDivisions.includes(d));

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
          {selectedDivisions.length > 0 && (
            <fieldset className={Styles.fieldset}>
              <legend className={Styles.legend}>{t('filters.division')}</legend>
              {selectedDivisions.map(division => (
                <div key={division} className={Styles.tag} onClick={() => handleDeselectDivision(division)}>
                  {division}
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
          title={t('widgetTitles.division')}
          data={
            <div>
              {availableDivisions.map(division => (
                <div key={division} className={Styles.tag} onClick={() => handleSelectDivision(division)}>
                  {division}
                </div>
              ))}
            </div>
          }
        />

                <div className="flex flex-row w-full">
                    <div className="flex-1 mr-2">
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
                    </div>
          <div className="flex-1">
            <Widget
              title={t("widgetTitles.difficultyFilter")}
              data={
                <div>
                  <label htmlFor="minDifficulty">{t("filters.min")}: </label>
                  <input
                    type="number"
                    name="minDifficulty"
                    value={draftMinDifficulty}
                    onChange={e => setDraftMinDifficulty(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && commitMinDifficulty()}
                    onBlur={commitMinDifficulty}
                    onFocus={e => e.target.select()}
                    className={Styles.input}
                  />
                  <br />
                  <label htmlFor="maxDifficulty">{t("filters.max")}: </label>
                  <input
                    type="number"
                    name="maxDifficulty"
                    value={draftMaxDifficulty}
                    onChange={e => setDraftMaxDifficulty(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && commitMaxDifficulty()}
                    onBlur={commitMaxDifficulty}
                    onFocus={e => e.target.select()}
                    className={Styles.input}
                  />
                </div>
              }
            />
          </div>
        </div>

        <div className="flex flex-row w-full">
          <div className="flex-1 mr-2">
            <Widget
              title={t("widgetTitles.ratingFilter")}
              data={
                <div>
                  <label htmlFor="minRating">{t("filters.min")}: </label>
                  <input
                    type="number"
                    name="minRating"
                    value={draftMinRating}
                    onChange={e => setDraftMinRating(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && commitMinRating()}
                    onBlur={commitMinRating}
                    onFocus={e => e.target.select()}
                    className={Styles.input}
                  />
                  <br />
                  <label htmlFor="maxRating">{t("filters.max")}: </label>
                  <input
                    type="number"
                    name="maxRating"
                    value={draftMaxRating}
                    onChange={e => setDraftMaxRating(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && commitMaxRating()}
                    onBlur={commitMaxRating}
                    onFocus={e => e.target.select()}
                    className={Styles.input}
                  />
                </div>
              }
            />
          </div>
          <div className="flex-1">
            <Widget
              title={t("widgetTitles.pointsFilter")}
              data={
                <div>
                  <label htmlFor="minPoints">{t("filters.min")}: </label>
                  <input
                    type="number"
                    name="minPoints"
                    value={draftMinPoints}
                    onChange={e => setDraftMinPoints(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && commitMinPoints()}
                    onBlur={commitMinPoints}
                    onFocus={e => e.target.select()}
                    className={Styles.input}
                  />
                  <br />
                  <label htmlFor="maxPoints">{t("filters.max")}: </label>
                  <input
                    type="number"
                    name="maxPoints"
                    value={draftMaxPoints}
                    onChange={e => setDraftMaxPoints(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && commitMaxPoints()}
                    onBlur={commitMaxPoints}
                    onFocus={e => e.target.select()}
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
import styles from './timeline.module.css';

interface TimelineProps {
  value: {
    legend: Record<string, string>;
    timeline: {
      beforeLunch: {percentage: number, color: string}[],
      afterLunch: {percentage: number, color: string}[]
    }
  }
}

function buildTimelineItem(entry: {percentage: number, color: string}, index: number) {
  return (
    <div key={index} style={{height: `${entry.percentage}%`, backgroundColor: entry.color}}></div>
  );
}

export default function Timeline({value}: TimelineProps) {

  const legendItems = Object.entries(value.legend).map(([name, color]) => (
    <div key={name} className={styles['legend__item']}>
      <div className={styles['legend__color-box']} style={{backgroundColor: color}}></div>
      {name}
    </div>
  ));

  const beforeLunchTimeline = value.timeline.beforeLunch.map(buildTimelineItem);
  const afterLunchTimeline = value.timeline.afterLunch.map(buildTimelineItem);

  return (
    <aside>
      <div>Timeline</div>
      <div className={styles.timeline}>
        <div className={styles['timeline__legend']}>
          { legendItems }
        </div>
        <div className={styles['timeline__content']}>
          <div className={styles['timeline__before-lunch']}>{beforeLunchTimeline}</div>
          <div style={{height: '6%', backgroundColor: 'red'}}></div>
          <div style={{height: '47%'}}>{afterLunchTimeline}</div>
        </div>
      </div>
    </aside>
  );
}

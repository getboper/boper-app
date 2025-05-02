import { useState, useMemo } from 'react';
import { Calendar, Views, View } from 'react-big-calendar';
import dayjs from 'dayjs';
import { dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Job } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Setup dayjs plugins
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/en-gb';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.locale('en-gb');

// Create the dayjs localizer
const localizer = dayjsLocalizer(dayjs);

type JobCalendarProps = {
  jobs: Job[];
  onSelectEvent?: (job: Job) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
};

export default function JobCalendar({ jobs, onSelectEvent, onSelectSlot }: JobCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Transform jobs into events for the calendar
  const events = useMemo(() => {
    return jobs.map(job => {
      const jobDate = job.dueDate ? new Date(job.dueDate) : new Date();
      // Set end time to be 1 hour after start time for visualization
      const endTime = new Date(jobDate);
      endTime.setHours(endTime.getHours() + 1);
      
      return {
        id: job.id,
        title: job.name,
        start: jobDate,
        end: endTime,
        job: job,
      };
    });
  }, [jobs]);

  // Custom event styling based on job status
  const eventStyleGetter = (event: any) => {
    const jobStatus = event.job.status;
    
    let backgroundColor;
    switch (jobStatus) {
      case 'booked':
        backgroundColor = '#3b82f6'; // blue-500
        break;
      case 'in-progress':
        backgroundColor = '#8b5cf6'; // purple-500
        break;
      case 'done':
        backgroundColor = '#10b981'; // emerald-500
        break;
      case 'paid':
        backgroundColor = '#6b7280'; // gray-500
        break;
      default:
        backgroundColor = '#3b82f6'; // blue-500
    }
    
    const style = {
      backgroundColor,
      borderRadius: '4px',
      color: 'white',
      border: 'none',
      fontWeight: 500,
    };
    
    return {
      style,
    };
  };

  // Calculate date range for the header
  const dateRangeTitle = useMemo(() => {
    if (view === Views.MONTH) {
      return dayjs(date).format('MMMM YYYY');
    } else if (view === Views.WEEK) {
      const start = dayjs(date).startOf('week');
      const end = dayjs(date).endOf('week');
      return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
    } else {
      return dayjs(date).format('dddd, D MMMM YYYY');
    }
  }, [date, view]);

  return (
    <Card className="shadow-md">
      <CardContent className="p-4 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h3 className="text-xl font-bold">{dateRangeTitle}</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setView(Views.MONTH)}
              className={cn(
                view === Views.MONTH ? "bg-primary text-white" : ""
              )}
            >
              Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setView(Views.WEEK)}
              className={cn(
                view === Views.WEEK ? "bg-primary text-white" : ""
              )}
            >
              Week
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
        
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={[Views.MONTH, Views.WEEK]}
            view={view}
            onView={(newView) => setView(newView as View)}
            date={date}
            onNavigate={setDate}
            onSelectEvent={(event) => onSelectEvent && onSelectEvent(event.job)}
            onSelectSlot={(slotInfo) => onSelectSlot && onSelectSlot(slotInfo)}
            selectable
            popup
            eventPropGetter={eventStyleGetter}
            formats={{
              timeGutterFormat: (date) => dayjs(date).format('h:mm A'),
              dayFormat: (date) => dayjs(date).format('ddd DD'),
              monthHeaderFormat: (date) => dayjs(date).format('MMMM YYYY'),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
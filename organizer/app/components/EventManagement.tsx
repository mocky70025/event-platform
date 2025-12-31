'use client';

import { useState } from 'react';
import EventList from './EventList';
import EventForm from './EventForm';

type View = 'list' | 'create' | 'edit';

export default function EventManagement() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [editingEventId, setEditingEventId] = useState<string | undefined>();

  const handleCreateEvent = () => {
    setEditingEventId(undefined);
    setCurrentView('create');
  };

  const handleEditEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setCurrentView('edit');
  };

  const handleFormComplete = () => {
    setCurrentView('list');
    setEditingEventId(undefined);
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setEditingEventId(undefined);
  };

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <EventForm
        eventId={editingEventId}
        onComplete={handleFormComplete}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <EventList
      onCreateEvent={handleCreateEvent}
      onEditEvent={handleEditEvent}
    />
  );
}


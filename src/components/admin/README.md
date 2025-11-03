# Member Approval System - Frontend Implementation

## Overview

This module provides a complete admin interface for approving/rejecting pending member registrations.

## Architecture

```
app/src/
├── services/
│   └── approvalService.ts          # Backend API service layer
├── store/
│   └── approvalStore.ts            # Zustand state management
└── components/
    └── admin/
        ├── PendingUsersTable.tsx   # Main UI component
        └── index.ts                # Barrel export
```

## Files Created

### 1. `/app/src/store/approvalStore.ts`

Zustand store managing approval system state and actions.

**State:**
- `pendingUsers: PendingUser[]` - List of users awaiting approval
- `selectedUserIds: Set<string>` - IDs of currently selected users
- `isLoading: boolean` - Loading state indicator
- `error: string | null` - Error message display

**Actions:**
- `fetchPendingUsers()` - Fetch all pending users
- `approveUser(userId, note?)` - Approve single user
- `rejectUser(userId, note?)` - Reject single user
- `bulkApprove(note?)` - Approve all selected users
- `bulkReject(note?)` - Reject all selected users
- `toggleUserSelection(userId)` - Toggle user selection
- `selectAll()` - Select all users
- `clearSelection()` - Clear all selections
- `clearError()` - Clear error message

### 2. `/app/src/components/admin/PendingUsersTable.tsx`

React component displaying pending users table with approval/rejection actions.

**Features:**
- ✅ Responsive table layout with TailwindCSS
- ✅ Individual approve/reject buttons per user
- ✅ Bulk actions for selected users
- ✅ Select all/clear selection functionality
- ✅ Profile image display (with fallback)
- ✅ Loading states and error handling
- ✅ Confirmation dialogs before actions
- ✅ Formatted date display (Korean locale)
- ✅ Empty state when no pending users
- ✅ Accessibility support (ARIA labels)

## Usage

### Basic Usage

```tsx
import { PendingUsersTable } from '@/components/admin';

function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PendingUsersTable />
    </div>
  );
}
```

### Direct Store Access (if needed)

```tsx
import { useApprovalStore } from '@/store/approvalStore';

function CustomComponent() {
  const { pendingUsers, isLoading, error } = useApprovalStore();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Pending: {pendingUsers.length}</h2>
      {/* Custom UI */}
    </div>
  );
}
```

## Component Props

The `PendingUsersTable` component has no props - it's a self-contained unit.

## Styling

Uses TailwindCSS utility classes:

- **Green** (`bg-green-600`) - Approve actions
- **Red** (`bg-red-600`) - Reject actions
- **Blue** (`bg-blue-50`) - Selection highlight
- **Gray** - Secondary actions and borders

## Accessibility

- ✅ Semantic HTML table structure
- ✅ ARIA labels on checkboxes
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ Screen reader friendly

## Error Handling

All errors are caught and displayed in a dismissable alert at the top of the component:

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-sm text-red-800">{error}</p>
    <button onClick={clearError}>×</button>
  </div>
)}
```

## Confirmation Dialogs

Before destructive actions, users are prompted with browser's native `confirm()`:

- Approve: "이 회원을 승인하시겠습니까?"
- Reject: "이 회원의 가입을 거부하시겠습니까?"
- Bulk Approve: "선택한 X명의 회원을 승인하시겠습니까?"
- Bulk Reject: "선택한 X명의 가입을 거부하시겠습니까?"

## Performance Optimizations

1. **Automatic Refetch** - After approve/reject, pending users list is automatically refreshed
2. **Selection State** - Uses `Set<string>` for O(1) lookup performance
3. **Memoized Calculations** - Selection state calculated once per render
4. **Conditional Rendering** - Bulk actions bar only shown when users selected

## TypeScript Types

```typescript
interface PendingUser {
  id: string;
  email: string;
  name: string;
  generation: number;
  occupation: string;
  phone: string;
  messenger_id: string | null;
  profile_image: string | null;
  created_at: string;
}

interface ApprovalStore {
  pendingUsers: PendingUser[];
  selectedUserIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  fetchPendingUsers: () => Promise<void>;
  approveUser: (userId: string, note?: string) => Promise<void>;
  rejectUser: (userId: string, note?: string) => Promise<void>;
  bulkApprove: (note?: string) => Promise<void>;
  bulkReject: (note?: string) => Promise<void>;
  toggleUserSelection: (userId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  clearError: () => void;
}
```

## Testing

### Manual Testing Checklist

- [ ] Component renders without errors
- [ ] Pending users load on mount
- [ ] Select all checkbox works (including indeterminate state)
- [ ] Individual user selection toggles correctly
- [ ] Bulk approve works for selected users
- [ ] Bulk reject works for selected users
- [ ] Single approve shows confirmation and works
- [ ] Single reject shows confirmation and works
- [ ] Error messages display and are dismissable
- [ ] Loading spinner shows during operations
- [ ] Empty state displays when no pending users
- [ ] Date formatting displays correctly (Korean locale)
- [ ] Profile images display (or fallback initials)
- [ ] Buttons are disabled during loading

### Unit Test Example

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingUsersTable } from './PendingUsersTable';

test('renders pending users table', async () => {
  render(<PendingUsersTable />);

  await waitFor(() => {
    expect(screen.getByText('가입 승인 대기 목록')).toBeInTheDocument();
  });
});

test('approves user on button click', async () => {
  const user = userEvent.setup();
  render(<PendingUsersTable />);

  const approveButton = screen.getByRole('button', { name: /승인/ });
  await user.click(approveButton);

  // Assert confirmation dialog
  // Assert user is removed from list
});
```

## Future Enhancements

- [ ] Add pagination for large lists
- [ ] Add search/filter functionality
- [ ] Add sort by column
- [ ] Add export to CSV
- [ ] Add approval history view
- [ ] Add batch import from CSV
- [ ] Add custom note input in dialog
- [ ] Add undo/redo functionality
- [ ] Add real-time updates (WebSocket)

## Dependencies

- `zustand` - State management
- `@supabase/supabase-js` - Backend API
- `react` - UI framework
- `tailwindcss` - Styling

## File Sizes

- `approvalStore.ts`: ~5KB
- `PendingUsersTable.tsx`: ~12KB
- Total: ~17KB (uncompressed)

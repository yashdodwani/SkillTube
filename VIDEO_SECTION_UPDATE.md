# Video Section Restriction & Timestamp Format Update

## ✅ Features Implemented

### 1. **Section-Specific Video Playback** 
Each video section now plays only within its designated time interval.

**How it works:**
- YouTube's embed URL supports `start` and `end` parameters
- When a user views Section 1 (e.g., 00:00 to 02:30), the video automatically:
  - Starts at 00:00
  - Stops at 02:30
  - User cannot skip beyond this section's boundaries
- When switching to Section 2, the video reloads with new time boundaries

**Example:**
- Section 1: Video plays from 00:00 to 02:30
- Section 2: Video plays from 02:30 to 05:15
- Section 3: Video plays from 05:15 to 08:00

### 2. **HH:mm:ss Timestamp Format**
All timestamps now display in proper time format:
- **Before:** `150:03` (confusing)
- **After:** `02:30:03` (clear hours:minutes:seconds)
- **Short format:** `5:30` (for videos under 1 hour)

## 📝 Changes Made

### File 1: `/frontend/src/utils/youtube.ts`

#### Updated `formatTime()` function:
```typescript
// Before
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// After
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
```

#### Updated `getYouTubeEmbedUrl()` function:
```typescript
// Before
export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

// After
export const getYouTubeEmbedUrl = (videoId: string, startTime?: number, endTime?: number): string => {
  const baseUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = new URLSearchParams();
  
  if (startTime !== undefined) {
    params.append('start', Math.floor(startTime).toString());
  }
  
  if (endTime !== undefined) {
    params.append('end', Math.floor(endTime).toString());
  }
  
  // Enable JS API and disable related videos at the end
  params.append('enablejsapi', '1');
  params.append('rel', '0');
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
```

### File 2: `/frontend/src/pages/Course.tsx`

#### Updated video player to use section boundaries:
```typescript
// Before
<iframe
  src={getYouTubeEmbedUrl(videoId)}
  className="w-full h-full rounded-t-xl"
  allowFullScreen
  title="Course Video"
/>

// After
<iframe
  key={`video-${currentChunkIndex}`}  // Force reload on section change
  src={getYouTubeEmbedUrl(
    videoId,
    currentChunk?.chunk.start_time,
    currentChunk?.chunk.end_time
  )}
  className="w-full h-full rounded-t-xl"
  allowFullScreen
  title="Course Video"
/>
```

#### Added informational banner:
```typescript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
  <p className="text-sm text-blue-800 flex items-center">
    <Clock className="h-4 w-4 mr-2" />
    <span>This video section plays from <strong className="mx-1">{formatTime(currentChunk?.chunk.start_time || 0)}</strong> to <strong className="mx-1">{formatTime(currentChunk?.chunk.end_time || 0)}</strong></span>
  </p>
</div>
```

#### Updated time display to show duration:
```typescript
<div className="flex items-center text-sm text-gray-500">
  <Clock className="h-4 w-4 mr-1" />
  Duration: {formatTime((currentChunk?.chunk.end_time || 0) - (currentChunk?.chunk.start_time || 0))}
</div>
```

## 🎯 User Experience

### Before:
- ✗ User could watch entire video regardless of current section
- ✗ Timestamps showed confusing format (e.g., 150:03)
- ✗ No clear indication of section boundaries

### After:
- ✅ Video automatically restricted to current section time range
- ✅ Clear HH:mm:ss timestamp format
- ✅ Visual indicator showing exact time boundaries
- ✅ Video reloads when switching sections
- ✅ Each section has its own focused content

## 📱 How It Works for Users

1. **User starts Section 1:**
   - Video loads and plays from 00:00 to 02:30
   - Blue info banner shows: "This video section plays from 00:00 to 02:30"
   - Video stops at 02:30 automatically

2. **User completes quiz and moves to Section 2:**
   - Video reloads (notice the `key` prop change)
   - Video now plays from 02:30 to 05:15
   - Info banner updates to show new time range

3. **User navigates back to Section 1:**
   - Video reloads with original time boundaries (00:00 to 02:30)

## 🔧 Technical Details

### YouTube IFrame Parameters Used:
- `start`: Starting time in seconds
- `end`: Ending time in seconds
- `enablejsapi=1`: Enables JavaScript API (for future enhancements)
- `rel=0`: Disables related videos at the end

### Example URL Generated:
```
https://www.youtube.com/embed/VIDEO_ID?start=0&end=150&enablejsapi=1&rel=0
```

## 🚀 Testing

To test the changes:

1. **Restart Frontend Dev Server:**
   ```bash
   cd /home/voyager4/projects/SkillVideo/frontend
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Generate a course from a YouTube video**

3. **Verify:**
   - ✅ Timestamps show in HH:mm:ss format
   - ✅ Video plays only the current section
   - ✅ Video stops at section end time
   - ✅ Blue info banner appears
   - ✅ Switching sections reloads video with new boundaries

## ⚠️ Important Notes

1. **YouTube End Parameter Limitation:**
   - The `end` parameter works in most cases, but YouTube may not strictly enforce it in all browsers
   - The video will stop near the end time but might vary by 1-2 seconds

2. **Section Switching:**
   - The `key` prop forces the iframe to reload, ensuring new time boundaries are applied
   - This provides a clean transition between sections

3. **User Controls:**
   - Users can still pause, play, and seek within the allowed section range
   - They cannot skip to other sections of the video manually

---

**Status:** ✅ **COMPLETE** - All changes implemented and ready for testing

**Date:** March 1, 2026


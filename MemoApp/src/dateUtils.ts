// src/utils/dateUtils.ts
export function getLastModifiedDate(created?: string, updated?: string): string {
    const rawDate = updated || created;

    if (!rawDate) return '';

    const date = new Date(rawDate);
    if (isNaN(date.getTime())) {
        console.warn('⚠️ Invalid date format:', rawDate); // 디버깅
        return '';
    }

    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

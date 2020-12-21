export default function checkValidDate(date: string): boolean {
    
    const dateParts = date.split('/'); // [ 12, 08, 2000 ]
    
    const dateObj = {
        year: Number(dateParts[2]),
        month: Number(dateParts[1]),
        day: Number(dateParts[0])
    }
    
    const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate()
    }
    
    if ( dateObj.year > today.year ||
        dateObj.year === today.year && dateObj.month > today.month ||
        dateObj.year === today.year && dateObj.month === today.month && dateObj.day > today.day
        ) return false;
        
    if ( dateObj.month < 0 || dateObj.month > 12 ) return false;
        
    const maxDays = [
        31,
        checkLeapYear(dateObj.year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    if ( dateObj.day < 0 || dateObj.day > maxDays[dateObj.month - 1] ) return false;

    return true;
}

function checkLeapYear(year: number) {
    let isLeap = false;

    if ( year % 4 === 0 && year % 100 !== 0 ||
        year % 400 === 0
    ) isLeap = true;

    return isLeap;
}
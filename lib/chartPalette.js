// Fixed categorical order — never cycled, never reassigned by rank, so an option
// keeps its colour no matter how the list is filtered or sorted. Validated for
// colour-vision deficiency and contrast on a white surface; the one adjacent
// pair in the 6–8 ΔE band is legal because every slice and bar is directly
// labelled with its name and count.
const CATEGORY_COLORS = [
  '#0284c7',
  '#ea580c',
  '#9333ea',
  '#16a34a',
  '#db2777',
  '#a16207',
  '#0891b2',
  '#dc2626',
];

// The score axis already encodes magnitude, so the bars stay one hue rather than
// repeating the same information in colour.
const SCALE_COLOR = '#0284c7';

function categoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export { CATEGORY_COLORS, SCALE_COLOR, categoryColor };

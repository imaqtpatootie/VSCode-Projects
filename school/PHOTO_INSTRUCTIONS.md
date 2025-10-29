# Photo Instructions for SNHS Website

## Adding Photos to the Website

The website now supports actual photos for alumni and faculty/staff members. Here's how to add them:

### Alumni Photos

Place alumni photos in the following directories:

```
school/alumni/
├── 2024/
│   ├── valedictorian.jpg
│   ├── salutatorian.jpg
│   ├── third-honor.jpg
│   ├── grad1.jpg
│   ├── grad2.jpg
│   └── grad3.jpg
├── 2023/
│   ├── grad1.jpg
│   ├── grad2.jpg
│   └── grad3.jpg
├── 2022/
│   └── [similar structure]
└── 2021/
    └── [similar structure]
```

### Faculty & Staff Photos

Place faculty and staff photos in these directories:

```
school/faculty-staff/
├── administrators/
│   ├── principal.jpg
│   └── vice-principal.jpg
├── teachers/
│   ├── math-teacher.jpg
│   ├── english-teacher.jpg
│   ├── science-teacher.jpg
│   └── history-teacher.jpg
└── support-staff/
    ├── librarian.jpg
    ├── guidance-counselor.jpg
    └── nurse.jpg
```

## Photo Requirements

### Technical Specifications
- **Format**: JPG, JPEG, PNG, or WebP
- **Size**: Minimum 300x300 pixels (square format preferred)
- **File Size**: Keep under 500KB for faster loading
- **Quality**: High resolution for crisp display

### Photo Guidelines
- **Professional appearance**: Formal or semi-formal attire
- **Clear face visibility**: Well-lit, facing camera
- **Neutral background**: Solid colors work best
- **Square crop**: Photos will be displayed in circular frames

## Fallback System

If a photo is not available or fails to load:
- The system automatically shows a colored circle with initials
- Colors match the school's theme (blue and gold)
- Initials are generated from the person's name

## Adding New People

To add new alumni or staff members:

1. **Add the photo** to the appropriate directory
2. **Update the HTML** in the respective page:
   - `alumni.html` for alumni
   - `faculty-staff.html` for faculty and staff
3. **Follow the existing pattern** for image paths and fallback initials

### Example HTML Structure

```html
<div class="alumni-photo" style="...">
    <img src="./alumni/2024/student-name.jpg" 
         alt="Student Name - Title" 
         style="..." 
         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    <div style="...">SN</div> <!-- Fallback with initials -->
</div>
```

## Tips for Best Results

1. **Consistent naming**: Use lowercase, hyphenated names (e.g., `maria-santos.jpg`)
2. **Batch processing**: Resize all photos to the same dimensions
3. **Compression**: Use tools like TinyPNG to reduce file sizes
4. **Testing**: Always test that images load correctly
5. **Backup**: Keep original high-resolution photos as backups

## Photo Privacy

- Ensure you have permission to use all photos
- Consider privacy policies for student and staff images
- Provide opt-out options for individuals who prefer not to be featured
# Sagay National High School Website

A modern, responsive website for Sagay National High School featuring clean design and excellent user experience.

## Features

- **Modern Design**: Clean, professional layout with school-appropriate colors (blue and gold)
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Subtle animations and hover effects for better user engagement
- **Accessible**: Built with accessibility best practices in mind
- **Fast Loading**: Optimized CSS and minimal dependencies

## Pages

- **Home** (`index.html`) - Main landing page with school overview, stats, academics, admissions, events, and contact
- **Alumni** (`alumni.html`) - Showcase of graduates with photo support and achievements
- **Faculty & Staff** (`faculty-staff.html`) - Information about school personnel with photo galleries
- **Login** (`login.html`) - Modern student/staff portal login page with enhanced UX

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - Interactive features without external dependencies
- **Google Fonts** - Inter font family for modern typography

## File Structure

```
school/
├── index.html              # Main homepage
├── alumni.html             # Alumni showcase
├── faculty-staff.html      # Faculty and staff information
├── login.html              # Login portal
├── assets/
│   ├── css/
│   │   ├── modern-styles.css   # Main stylesheet
│   │   └── modern-login.css    # Modern login page styles
│   ├── js/
│   │   └── modern-login.js     # Enhanced login functionality
│   └── imgs/
│       └── snhs-front-gate.jpg # School image
├── alumni/                 # Alumni photos (organized by year)
└── faculty-staff/          # Faculty photos (organized by department)
```

## Design System

### Colors
- **Primary Blue**: #1e40af (School's main color)
- **Accent Gold**: #f59e0b (Complementary accent)
- **Neutral Grays**: Various shades for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 600 weight, various sizes
- **Body Text**: 400 weight, good line height for readability

### Components
- **Cards**: Consistent card design with hover effects
- **Buttons**: Primary and secondary button styles
- **Forms**: Clean, accessible form inputs
- **Navigation**: Fixed header with smooth scrolling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Getting Started

1. Open `index.html` in a web browser
2. No build process required - pure HTML/CSS/JS
3. For development, use a local server for best experience

## Customization

The design system uses CSS custom properties (variables) for easy theming. Main variables are defined in `:root` in `modern-styles.css`.

## School Information

**Sagay National High School**
- Founded: 1948
- Location: Sagay City, Negros Occidental, Philippines
- Students: 5,022
- Teachers: 144
- Campus Size: 800,000 square meters

## License

This project is for educational purposes for Sagay National High School.
#
# Login Portal Features

The enhanced login portal includes:

### Modern Design
- **Split-screen layout** with school information panel and login form
- **School branding** with SNHS colors and statistics
- **Responsive design** that adapts to mobile devices
- **Smooth animations** and hover effects

### User Experience
- **User type selection** (Student/Staff) with different input placeholders
- **Password visibility toggle** for better usability
- **Form validation** with real-time feedback
- **Remember me** functionality with local storage
- **Loading states** and success/error feedback
- **Keyboard shortcuts** (Enter to submit, Escape to clear)

### Accessibility
- **Screen reader support** with proper ARIA labels
- **Keyboard navigation** for all interactive elements
- **High contrast** colors for better visibility
- **Focus indicators** for form elements

### Demo Credentials
For testing purposes (development only):

**Students:**
- Username: `student123` | Password: `password123`
- Username: `2024-001` | Password: `snhs2024`
- Username: `juan.delacruz` | Password: `student123`

**Staff:**
- Username: `teacher1` | Password: `teacher123`
- Username: `admin` | Password: `admin123`
- Username: `principal` | Password: `principal123`

### Security Features
- **Client-side validation** for immediate feedback
- **Password strength requirements** (minimum 6 characters)
- **Form sanitization** to prevent basic attacks
- **Session management** preparation for backend integration
## 
Photo Management

The website now supports actual photos for alumni and faculty members:

### Features
- **Automatic fallback**: If photos aren't available, shows colored circles with initials
- **Responsive images**: Photos scale properly on all devices  
- **Hover effects**: Subtle animations when hovering over photos
- **Professional styling**: Circular frames with school-colored borders

### Adding Photos
1. Place photos in the appropriate directories:
   - Alumni: `school/alumni/[year]/[filename].jpg`
   - Faculty: `school/faculty-staff/[department]/[filename].jpg`
2. Photos should be square format, minimum 300x300 pixels
3. Keep file sizes under 500KB for optimal loading

See `PHOTO_INSTRUCTIONS.md` for detailed guidelines on adding and managing photos.
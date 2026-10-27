// Preload + decode every game sprite right after first paint so the first run
// doesn't stall on network/decode (sprites are CSS backgrounds, so the browser
// otherwise only fetches them the moment they first appear on screen).
const GAME_SPRITES = [
  'mario-stop', 'mario-jump', 'goomba-1', 'goomba-2', 'pipe', 'cloud',
  'block-normal', 'block-question-1',
  'coin-1', 'coin-2', 'coin-3', 'coin-4',
  'coin-score-1', 'coin-score-2', 'coin-score-3', 'coin-score-4',
  'coinget-1', 'coinget-2', 'coinget-3', 'coinget-4', 'coinget-5', 'coinget-6', 'coinget-7', 'coinget-8'
];
window.addEventListener('load', () => {
  GAME_SPRITES.forEach(n => {
    const img = new Image();
    img.decoding = 'async';
    img.src = 'assets/' + n + '.png';
    if (img.decode) img.decode().catch(() => {});
  });
});

// Freeze header cat while any modal is open, or the game is active
const headerCat = document.querySelector('.header-cat-outer');
function syncCat() {
  const gameActive = document.body.classList.contains('game-active');
  headerCat.classList.toggle('cat-frozen', !!document.querySelector('.modal-overlay.open') || gameActive);
}
document.addEventListener('click', syncCat);

// Clock
function updateClock() {
  const now = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('headerClock').textContent =
    `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${hh}:${mm}`;
}
updateClock();
setInterval(updateClock, 1000);

const modal    = document.getElementById('msgModal');
const openBtn  = document.getElementById('openMsgModal');
const closeBtn = document.getElementById('msgModalClose');

openBtn.addEventListener('click', (e) => { e.preventDefault(); modal.classList.add('open'); });
closeBtn.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

// About modal
const aboutModal    = document.getElementById('aboutModal');
const aboutOpenBtn  = document.querySelector('a[href="#about"]');
const aboutCloseBtn = document.getElementById('aboutModalClose');

aboutOpenBtn.addEventListener('click', (e) => { e.preventDefault(); aboutModal.classList.add('open'); });
aboutCloseBtn.addEventListener('click', () => aboutModal.classList.remove('open'));
aboutModal.addEventListener('click', (e) => { if (e.target === aboutModal) aboutModal.classList.remove('open'); });

// Bin modal
const binModal    = document.getElementById('binModal');
const binOpenBtn  = document.getElementById('openBinModal');
const binCloseBtn = document.getElementById('binModalClose');

binOpenBtn.addEventListener('click', (e) => { e.preventDefault(); binModal.classList.add('open'); });

// Mobile: selecting a bin item should read as opening a brand new window for
// it (own title + icon, list and folder info gone) rather than an inline
// panel next to the still-visible list — same pattern as Projects.
const binWindowEl = document.querySelector('.bin-window');
const binTitleIcon = document.getElementById('binTitleIcon');
const binTitleText = document.getElementById('binTitleText');
const binTitleIconDefaultHTML = binTitleIcon.innerHTML;
const isMobileBin = () => window.innerWidth <= 500;

// On mobile, closing the bin-item "window" goes back to the bin list (like
// closing a window reveals the one under it); closing the list itself closes
// the whole modal. Desktop always closes the whole modal since list and
// detail are both visible together there.
function closeOrBackBin() {
  if (isMobileBin() && binWindowEl.classList.contains('detail-open')) {
    resetBinSelection();
  } else {
    binModal.classList.remove('open');
    resetBinSelection();
  }
}
binCloseBtn.addEventListener('click', closeOrBackBin);
binModal.addEventListener('click', (e) => { if (e.target === binModal) closeOrBackBin(); });

// Bin sections: label shows the live item count, header click collapses/expands
document.querySelectorAll('.bin-section').forEach(section => {
  const head    = section.querySelector('.bin-section-head');
  const chevron = section.querySelector('.bin-chevron');
  const title   = section.querySelector('.bin-section-title');
  const count   = section.querySelectorAll('.bin-item').length;

  title.textContent = `${section.dataset.sectionName} (${count})`;

  head.addEventListener('click', () => {
    const collapsed = section.classList.toggle('collapsed');
    chevron.src = collapsed ? 'assets/bin-chevron-right.svg' : 'assets/bin-chevron.svg';
  });
});

// Bin item selection: shows a preview (image, caption, download) in the sidebar
const binSidebarDefault   = document.getElementById('binSidebarDefault');
const binSidebarDetail    = document.getElementById('binSidebarDetail');
const binDetailImg        = document.getElementById('binDetailImg');
const binDetailImgPlaceholder = document.getElementById('binDetailImgPlaceholder');
const binDetailTitle      = document.getElementById('binDetailTitle');
const binDetailCaption    = document.getElementById('binDetailCaption');
const binDownloadBtn      = document.getElementById('binDownloadBtn');
const binSidebarLink      = document.getElementById('binSidebarLink');
const binLinkIcon         = document.getElementById('binLinkIcon');
const binLinkTitle        = document.getElementById('binLinkTitle');
const binLinkCaption      = document.getElementById('binLinkCaption');
const binLinkBtn          = document.getElementById('binLinkBtn');
const binLinkLabel        = document.getElementById('binLinkLabel');
let binSelectedDownload = null;

document.querySelectorAll('.bin-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.bin-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');

    if (item.dataset.type === 'link') {
      const iconSource = item.querySelector('.ic-bin-strava, .ic-bin-discogs, .ic-bin-rewish, .ic-bin-photo');
      const title = item.dataset.title || item.querySelector('.bin-item-label').textContent;
      binLinkIcon.innerHTML = iconSource.outerHTML;
      binLinkTitle.textContent   = title;
      binLinkCaption.textContent = item.dataset.caption || '';
      binLinkBtn.href            = item.dataset.linkUrl || '#';
      binLinkLabel.textContent   = item.dataset.linkLabel || 'Open link';

      binSidebarDefault.style.display = 'none';
      binSidebarDetail.style.display  = 'none';
      binSidebarLink.style.display    = 'flex';
      setMobileBinTitle(title, iconSource);
      return;
    }

    const image   = item.dataset.image;
    const label   = item.querySelector('.bin-item-label').textContent;
    binSelectedDownload = item.dataset.download || image || null;

    binDetailTitle.textContent   = label;
    binDetailCaption.textContent = item.dataset.caption || '';

    if (image) {
      binDetailImg.src = image;
      binDetailImg.style.display = 'block';
      binDetailImgPlaceholder.style.display = 'none';
    } else {
      binDetailImg.style.display = 'none';
      binDetailImgPlaceholder.style.display = 'flex';
    }

    binSidebarDefault.style.display = 'none';
    binSidebarLink.style.display    = 'none';
    binSidebarDetail.style.display  = 'flex';
    setMobileBinTitle(label, item.querySelector('.ic-bin-photo'));
  });
});

function setMobileBinTitle(title, iconSource) {
  if (!isMobileBin()) return;
  binWindowEl.classList.add('detail-open');
  binTitleText.textContent = title;
  binTitleIcon.innerHTML = '';
  if (iconSource) {
    const clone = iconSource.cloneNode(true);
    clone.style.transform = 'scale(0.4167)';
    clone.style.transformOrigin = 'top left';
    binTitleIcon.appendChild(clone);
  }
}

binDownloadBtn.addEventListener('click', () => {
  if (!binSelectedDownload) return;
  const a = document.createElement('a');
  a.href = binSelectedDownload;
  a.download = binDetailTitle.textContent || '';
  a.click();
});

function resetBinSelection() {
  document.querySelectorAll('.bin-item').forEach(i => i.classList.remove('selected'));
  binSidebarDefault.style.display = '';
  binSidebarDetail.style.display  = 'none';
  binSidebarLink.style.display    = 'none';
  binWindowEl.classList.remove('detail-open');
  binTitleText.textContent = 'Bin';
  binTitleIcon.innerHTML = binTitleIconDefaultHTML;
}

// Clicking anywhere in the file list that isn't an item deselects back to the default view
document.querySelector('.bin-main').addEventListener('click', (e) => {
  if (!e.target.closest('.bin-item')) resetBinSelection();
});

// Project item selection
const projSidebarDefault = document.getElementById('projSidebarDefault');
const projSidebarDetail  = document.getElementById('projSidebarDetail');
const projDetailImg      = document.getElementById('projDetailImg');
const projDetailImgPlaceholder = document.getElementById('projDetailImgPlaceholder');
const projDetailTitle    = document.getElementById('projDetailTitle');
const projDetailDesc     = document.getElementById('projDetailDesc');
const projDetailDomain   = document.getElementById('projDetailDomain');
const projDetailTask     = document.getElementById('projDetailTask');
const projDetailFigmaBtn     = document.getElementById('projDetailFigmaBtn');
const projDetailPrototypeBtn = document.getElementById('projDetailPrototypeBtn');
const projDetailMobileActions     = document.querySelector('.proj-detail-mobile-actions');
const projDetailMobileComingSoon  = document.getElementById('projDetailMobileComingSoon');
const btnCaseStudy      = document.getElementById('btnCaseStudy');
const btnCaseStudyLabel = document.getElementById('btnCaseStudyLabel');

function setProjectLinkBtn(btn, url) {
  if (url) {
    btn.href = url;
    btn.classList.remove('is-disabled');
    btn.removeAttribute('aria-disabled');
  } else {
    btn.removeAttribute('href');
    btn.classList.add('is-disabled');
    btn.setAttribute('aria-disabled', 'true');
  }
}

// Mobile: selecting a project should read as opening a brand new window for
// it (own title + icon, list and folder info gone) rather than an inline
// panel next to the still-visible grid.
const projectsWindowEl  = document.querySelector('.projects-window');
const projectsTitleIcon = document.getElementById('projectsTitleIcon');
const projectsTitleText = document.getElementById('projectsTitleText');
const projectsTitleIconDefaultHTML = projectsTitleIcon.innerHTML;
const isMobileProjects = () => window.innerWidth <= 500;

// Grid tiles are narrow on phones, so projects with a data-label-mobile
// shorthand (set in the HTML) show that instead of their full desktop title.
function applyProjectLabels() {
  const mobile = isMobileProjects();
  document.querySelectorAll('.proj-item').forEach(item => {
    const label = item.querySelector('.proj-label');
    if (!label) return;
    label.textContent = (mobile && item.dataset.labelMobile) || item.dataset.title;
  });
}
applyProjectLabels();
window.addEventListener('resize', applyProjectLabels);

document.querySelectorAll('.proj-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.proj-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');

    const image  = item.dataset.image;
    projDetailTitle.textContent  = item.dataset.title;
    projDetailDesc.textContent   = item.dataset.desc;
    projDetailDomain.textContent = item.dataset.domain;
    projDetailTask.textContent   = item.dataset.task;

    if (image) {
      projDetailImg.src = image;
      projDetailImg.style.display = 'block';
      projDetailImgPlaceholder.style.display = 'none';
    } else {
      projDetailImg.style.display = 'none';
      projDetailImgPlaceholder.style.display = 'flex';
    }

    // Mobile skips the in-page case-study preview and links straight out to
    // Figma / the prototype. Every project shows both buttons for a
    // consistent layout — ones without a link yet just render disabled
    // instead of disappearing.
    const study = caseStudies[item.dataset.title];
    setProjectLinkBtn(projDetailFigmaBtn,     study && study.figmaUrl);
    setProjectLinkBtn(projDetailPrototypeBtn, study && study.prototypeUrl);

    // Mobile: projects without a case study yet show a single "Coming
    // soon..." indicator instead of the (irrelevant, disabled) Figma /
    // prototype links.
    projDetailMobileActions.classList.toggle('force-hidden', !study);
    projDetailMobileComingSoon.classList.toggle('force-hidden', !!study);

    // Projects without a case study yet show a disabled button instead of
    // opening the modal.
    if (study) {
      btnCaseStudy.disabled = false;
      btnCaseStudy.classList.remove('is-disabled');
      btnCaseStudy.removeAttribute('aria-disabled');
      btnCaseStudyLabel.textContent = 'Review case study';
    } else {
      btnCaseStudy.disabled = true;
      btnCaseStudy.classList.add('is-disabled');
      btnCaseStudy.setAttribute('aria-disabled', 'true');
      btnCaseStudyLabel.textContent = 'Coming soon...';
    }

    projSidebarDefault.style.display = 'none';
    projSidebarDetail.style.display  = 'block';

    if (isMobileProjects()) {
      projectsWindowEl.classList.add('detail-open');
      projectsTitleText.textContent = item.dataset.title;
      const iconSource = item.querySelector('.ic-proj');
      projectsTitleIcon.innerHTML = '';
      if (iconSource) {
        const clone = iconSource.cloneNode(true);
        clone.style.transform = 'scale(0.4167)';
        clone.style.transformOrigin = 'top left';
        projectsTitleIcon.appendChild(clone);
      }
    }
  });
});

function resetProjSelection() {
  document.querySelectorAll('.proj-item').forEach(i => i.classList.remove('selected'));
  projSidebarDefault.style.display = '';
  projSidebarDetail.style.display  = 'none';
  projectsWindowEl.classList.remove('detail-open');
  projectsTitleText.textContent = 'Projects';
  projectsTitleIcon.innerHTML = projectsTitleIconDefaultHTML;
}

// Clicking anywhere in the grid that isn't an item deselects back to the default view
document.querySelector('.projects-grid-area').addEventListener('click', (e) => {
  if (!e.target.closest('.proj-item')) resetProjSelection();
});

// Projects modal
const projectsModal    = document.getElementById('projectsModal');
const projectsOpenBtn  = document.getElementById('openProjectsModal');
const projectsCloseBtn = document.getElementById('projectsModalClose');

projectsOpenBtn.addEventListener('click', (e) => { e.preventDefault(); projectsModal.classList.add('open'); });

// On mobile, closing the project-detail "window" goes back to the projects
// list (like closing a window reveals the one under it); closing the list
// itself closes the whole modal. Desktop always closes the whole modal since
// list and detail are both visible together there.
function closeOrBackProjects() {
  if (isMobileProjects() && projectsWindowEl.classList.contains('detail-open')) {
    resetProjSelection();
  } else {
    projectsModal.classList.remove('open');
    resetProjSelection();
  }
}
projectsCloseBtn.addEventListener('click', closeOrBackProjects);
projectsModal.addEventListener('click', (e) => {
  if (e.target === projectsModal) closeOrBackProjects();
});

// Case Study modal
const caseStudyModal  = document.getElementById('caseStudyModal');
const caseStudyClose  = document.getElementById('caseStudyModalClose');
const csTitle         = document.getElementById('csTitle');
const csSidebar       = document.getElementById('csSidebar');
const csSlidesList    = document.getElementById('csSlidesList');
const csSlideView     = document.getElementById('csSlideView');
const csToggle        = document.getElementById('csToggle');

// w/h are the main image's natural pixel size. They're set as width/height
// attributes on the <img> so the browser reserves the right aspect ratio
// before the image loads — without this, images pop in at height 0 and
// reflow the slide list while loading, which threw off the scroll-spy
// (it kept jumping the sidebar to whichever slide loaded last).
const sowiseSlides = [
  { thumb: 'assets/sowise-01-cover.webp',                  main: 'assets/sowise-01-cover.webp',                  label: 'Thumbnail',           w: 2900, h: 1600 },
  { thumb: 'assets/sowise-02-about.webp',                  main: 'assets/sowise-02-about.webp',                  label: 'About product',       w: 2900, h: 1600 },
  { thumb: 'assets/sowise-03-problem.webp',                main: 'assets/sowise-03-problem.webp',                label: 'Problem',             w: 2900, h: 1600 },
  { thumb: 'assets/sowise-04-objectives.webp',              main: 'assets/sowise-04-objectives.webp',             label: 'Objectives',          w: 2900, h: 1600 },
  { thumb: 'assets/sowise-05-challenge.webp',              main: 'assets/sowise-05-challenge.webp',              label: 'Main challenge',      w: 2900, h: 1600 },
  { thumb: 'assets/sowise-06-competitor-analysis.webp',    main: 'assets/sowise-06-competitor-analysis.webp',    label: 'Competitor analysis', w: 2900, h: 1600 },
  { thumb: 'assets/sowise-07-competitor-feedback.webp',    main: 'assets/sowise-07-competitor-feedback.webp',    label: 'Competitor feedback', w: 1800, h: 993 },
  { thumb: 'assets/sowise-08-persona-jack.webp',           main: 'assets/sowise-08-persona-jack.webp',           label: 'Persona: Jack',       w: 2800, h: 1600 },
  { thumb: 'assets/sowise-09-persona-stefan.webp',         main: 'assets/sowise-09-persona-stefan.webp',         label: 'Persona: Stefan',     w: 2800, h: 1600 },
  { thumb: 'assets/sowise-10-research-findings.webp',      main: 'assets/sowise-10-research-findings.webp',      label: 'Research findings',   w: 2800, h: 1600 },
  { thumb: 'assets/sowise-11-design-brief.webp',           main: 'assets/sowise-11-design-brief.webp',           label: 'Design brief',        w: 2800, h: 1600 },
  { thumb: 'assets/sowise-12-jobs-to-be-done.webp',        main: 'assets/sowise-12-jobs-to-be-done.webp',        label: 'Jobs-to-be-done',     w: 2800, h: 1600 },
  { thumb: 'assets/sowise-13-information-architecture.webp', main: 'assets/sowise-13-information-architecture.webp', label: 'Information architecture', w: 2800, h: 3160 },
  { thumb: 'assets/sowise-14-wireframes.webp',             main: 'assets/sowise-14-wireframes.webp',             label: 'Wireframes',          w: 2800, h: 1600 },
  { thumb: 'assets/sowise-15-onboarding.webp',             main: 'assets/sowise-15-onboarding.webp',             label: 'Onboarding',          w: 2800, h: 1600 },
  { thumb: 'assets/sowise-16-dashboard.webp',              main: 'assets/sowise-16-dashboard.webp',              label: 'Dashboard',           w: 2800, h: 1600 },
  { thumb: 'assets/sowise-17-dashboard-detail.webp',       main: 'assets/sowise-17-dashboard-detail.webp',       label: 'Dashboard detail',    w: 2800, h: 1600 },
  { thumb: 'assets/sowise-18-search-engine.webp',          main: 'assets/sowise-18-search-engine.webp',          label: 'Search engine',       w: 2800, h: 1600 },
  { thumb: 'assets/sowise-19-search-engine-detail.webp',   main: 'assets/sowise-19-search-engine-detail.webp',   label: 'Search engine detail', w: 2800, h: 1600 },
  { thumb: 'assets/sowise-20-search-results.webp',         main: 'assets/sowise-20-search-results.webp',         label: 'Search results',      w: 2800, h: 1600 },
  { thumb: 'assets/sowise-21-work-with-documents.webp',    main: 'assets/sowise-21-work-with-documents.webp',    label: 'Work with documents', w: 2800, h: 1600 },
  { thumb: 'assets/sowise-22-contract-view.webp',          main: 'assets/sowise-22-contract-view.webp',          label: 'Contract view',       w: 2800, h: 1600 },
  { thumb: 'assets/sowise-23-comments-sharing.webp',       main: 'assets/sowise-23-comments-sharing.webp',       label: 'Comments & sharing',  w: 2800, h: 1600 },
  { thumb: 'assets/sowise-24-signing-process.webp',        main: 'assets/sowise-24-signing-process.webp',        label: 'Signing process',     w: 2800, h: 1600 },
  { thumb: 'assets/sowise-25-notifications.webp',          main: 'assets/sowise-25-notifications.webp',          label: 'Notifications',       w: 2800, h: 1705 },
  { thumb: 'assets/sowise-26-templates-library.webp',      main: 'assets/sowise-26-templates-library.webp',      label: 'Templates library',   w: 2800, h: 1600 },
  { thumb: 'assets/sowise-27-productivity.webp',           main: 'assets/sowise-27-productivity.webp',           label: 'Stay motivated',      w: 2800, h: 1600 },
  { thumb: 'assets/sowise-28-profile-settings.webp',       main: 'assets/sowise-28-profile-settings.webp',       label: 'Profile settings',    w: 2800, h: 1600 },
  { thumb: 'assets/sowise-29-organization-settings.webp',  main: 'assets/sowise-29-organization-settings.webp',  label: 'Organization settings', w: 2800, h: 1600 },
];

const novapaySlides = [
  { thumb: 'assets/novapay-1-cover.webp',     main: 'assets/novapay-1-cover.webp',     label: 'Thumbnail',       w: 1400, h: 840  },
  { thumb: 'assets/novapay-2-about.webp',     main: 'assets/novapay-2-about.webp',     label: 'About product',   w: 1400, h: 726  },
  { thumb: 'assets/novapay-3-tldr.webp',      main: 'assets/novapay-3-tldr.webp',      label: 'TL;DR',            w: 1400, h: 1370 },
  { thumb: 'assets/novapay-4-analysis.webp',  main: 'assets/novapay-4-analysis.webp',  label: 'Market analysis', w: 1400, h: 1249 },
  { thumb: 'assets/novapay-5-rewards.webp',   main: 'assets/novapay-5-rewards.webp',   label: 'Rewards system',  w: 1322, h: 1400 },
  { thumb: 'assets/novapay-6-solution.webp',  main: 'assets/novapay-6-solution.webp',  label: 'Design solution', w: 1358, h: 1400 },
  { thumb: 'assets/novapay-7-prototype.webp', main: 'assets/novapay-7-prototype.webp', label: 'Prototype',       w: 1400, h: 624  },
  { thumb: 'assets/novapay-8-feedback.webp',  main: 'assets/novapay-8-feedback.webp',  label: 'User feedback',   w: 1400, h: 792  },
];

const controllaSlides = [
  { thumb: 'assets/controlla-01-cover.webp',              main: 'assets/controlla-01-cover.webp',              label: 'Cover',                    w: 2880, h: 2118 },
  { thumb: 'assets/controlla-02-background.webp',         main: 'assets/controlla-02-background.webp',         label: 'Background',               w: 2880, h: 840  },
  { thumb: 'assets/controlla-03-results.webp',            main: 'assets/controlla-03-results.webp',            label: 'Results',                  w: 2880, h: 1119 },
  { thumb: 'assets/controlla-04-objectives.webp',         main: 'assets/controlla-04-objectives.webp',         label: 'Objectives',               w: 2880, h: 1080 },
  { thumb: 'assets/controlla-05-working-process.webp',    main: 'assets/controlla-05-working-process.webp',    label: 'Working process',          w: 2880, h: 1200 },
  { thumb: 'assets/controlla-06-onboarding.webp',         main: 'assets/controlla-06-onboarding.webp',         label: 'Onboarding',               w: 2880, h: 2211 },
  { thumb: 'assets/controlla-07-onboarding-flow.webp',    main: 'assets/controlla-07-onboarding-flow.webp',    label: 'Onboarding flow',          w: 2880, h: 2211 },
  { thumb: 'assets/controlla-08-app-store.webp',          main: 'assets/controlla-08-app-store.webp',          label: 'App Store listing',        w: 2880, h: 1440 },
  { thumb: 'assets/controlla-09-free-interface.webp',     main: 'assets/controlla-09-free-interface.webp',     label: 'Free app interface',       w: 2880, h: 2444 },
  { thumb: 'assets/controlla-10-settings.webp',           main: 'assets/controlla-10-settings.webp',           label: 'Settings',                 w: 2880, h: 1482 },
  { thumb: 'assets/controlla-11-app-details.webp',        main: 'assets/controlla-11-app-details.webp',        label: 'App details',              w: 2880, h: 2565 },
  { thumb: 'assets/controlla-12-premium-interface.webp',  main: 'assets/controlla-12-premium-interface.webp',  label: 'Premium app interface',    w: 2880, h: 2651 },
];

// Per-project case study content: slides shown in the modal, plus the
// external links the toolbar buttons should open (when available).
const caseStudies = {
  'Sowise | Contract management tool': {
    slides: sowiseSlides,
    figmaUrl: 'https://www.figma.com/proto/t263lJqFQywKvyj5vYEnij/Case-Study?node-id=7-78&p=f&viewport=902%2C230%2C0.02&t=uXUpXc1fsvhp3IZ2-1&scaling=scale-down-width&content-scaling=fixed&page-id=7%3A77',
    prototypeUrl: 'https://www.figma.com/proto/9R8ktxmwIswNrEBKrvTGDF/UI-Design?node-id=72-1137&p=f&viewport=670%2C827%2C0.03&t=kAvUWfmEcWk0DeXx-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=72%3A1137&page-id=5%3A2',
  },
  'NovaPay | Loyalty program concept': {
    slides: novapaySlides,
    figmaUrl: 'https://www.figma.com/design/Wsxgl28IfXidI5vOIWAckA/Oksana-Popova-%E2%80%93-NovaPay-Test-Task?node-id=3409-607&t=hAbgyK0O2wJ3K0RK-11',
    prototypeUrl: 'https://www.figma.com/proto/Wsxgl28IfXidI5vOIWAckA/Oksana-Popova-%E2%80%93-NovaPay-Test-Task?node-id=3204-3400&t=hAbgyK0O2wJ3K0RK-1',
  },
  'Controlla | Remote control': {
    slides: controllaSlides,
    figmaUrl: 'https://www.figma.com/proto/u18MnHRYRrA1mdRM6Jc3CY/Controlla-Case?node-id=604-557&viewport=518%2C192%2C0.09&t=Pb3OuKMAItXIuUAI-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=424%3A4706&page-id=0%3A1',
  },
};

// Projects without a case study yet ("Coming soon") render faded in the grid.
document.querySelectorAll('.proj-item').forEach(item => {
  item.classList.toggle('coming-soon', !caseStudies[item.dataset.title]);
});

let scrollObserver = null;

function buildCsSlides(slides) {
  csSlidesList.innerHTML = '';
  csSlideView.innerHTML  = '';
  if (scrollObserver) { scrollObserver.disconnect(); scrollObserver = null; }

  const thumbEls = [];
  const slideEls = [];

  slides.forEach((slide, i) => {
    // Sidebar thumbnail
    const thumb = document.createElement('div');
    thumb.className = 'casestudy-thumb' + (i === 0 ? ' active' : '');
    thumb.innerHTML = `
      <img class="casestudy-thumb-img" src="${slide.thumb.replace('.webp', '-thumb.webp')}" loading="lazy" decoding="async" alt="${slide.label}" />
      <div class="casestudy-thumb-label-wrap">
        <span class="casestudy-thumb-label">${slide.label}</span>
      </div>`;
    thumbEls.push(thumb);

    // Main slide item
    const item = document.createElement('div');
    item.className = 'casestudy-slide-item';
    item.innerHTML = `<img class="casestudy-slide-img" decoding="async" src="${slide.main}" alt="${slide.label}" width="${slide.w}" height="${slide.h}" />`;
    slideEls.push(item);

    thumb.addEventListener('click', () => {
      thumbEls.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      item.scrollIntoView({ behavior: 'smooth' });
    });

    csSlidesList.appendChild(thumb);
    csSlideView.appendChild(item);
  });

  // Scroll-spy: highlight sidebar thumb matching the visible slide
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = slideEls.indexOf(entry.target);
        if (idx !== -1) {
          thumbEls.forEach((t, i) => t.classList.toggle('active', i === idx));
          thumbEls[idx].scrollIntoView({ block: 'nearest' });
        }
      }
    });
  }, { root: csSlideView, threshold: 0.5 });

  slideEls.forEach(el => scrollObserver.observe(el));

  // Reset to first slide (both the main view and the sidebar thumb list)
  csSlideView.scrollTop = 0;
  csSlidesList.scrollTop = 0;
}

const csPrototypeBtn = document.querySelector('.casestudy-btn-outline-wrap');
const csFigmaBtn     = document.querySelector('.casestudy-btn-primary-wrap');
let csFigmaUrl = null;
let csPrototypeUrl = null;

document.querySelector('.btn-case-study').addEventListener('click', () => {
  if (btnCaseStudy.disabled) return;

  const title = projDetailTitle.textContent || 'Case Study';
  const study = caseStudies[title];

  csTitle.textContent = title;
  // On narrow screens the slides panel is an overlay drawer, so start collapsed
  // instead of covering the slide the user just opened.
  const startCollapsed = window.innerWidth <= 700;
  csSidebar.classList.toggle('collapsed', startCollapsed);
  csToggleIcon.src = startCollapsed ? 'assets/cs-panel-open.svg' : 'assets/cs-panel.svg';
  buildCsSlides(study ? study.slides : sowiseSlides);

  csFigmaUrl     = study ? study.figmaUrl     : null;
  csPrototypeUrl = study ? study.prototypeUrl : null;
  csPrototypeBtn.style.display = csPrototypeUrl ? '' : 'none';
  caseStudyModal.classList.add('open');
});

csFigmaBtn.addEventListener('click', () => {
  if (csFigmaUrl) window.open(csFigmaUrl, '_blank', 'noopener');
});
csPrototypeBtn.addEventListener('click', () => {
  if (csPrototypeUrl) window.open(csPrototypeUrl, '_blank', 'noopener');
});

caseStudyClose.addEventListener('click', () => caseStudyModal.classList.remove('open'));
caseStudyModal.addEventListener('click', (e) => {
  if (e.target === caseStudyModal) caseStudyModal.classList.remove('open');
});

const csToggleIcon = csToggle.querySelector('img');
csToggle.addEventListener('click', () => {
  const collapsed = csSidebar.classList.toggle('collapsed');
  csToggleIcon.src = collapsed ? 'assets/cs-panel-open.svg' : 'assets/cs-panel.svg';
});

// ── Mario runner game ──
// Single state-driven requestAnimationFrame loop (only ticks while
// 'running'); idle and gameover are static frames with no scrolling.
(function () {
  // Everything below is expressed per "tile" (the base sprite unit) so the
  // whole game scales together with --tile, which is fluid with viewport
  // width (see .game-scene in styles.css). Ratios match the original
  // 40px-tile tuning: gravity 2200/40, jump 720/40, speed 240/40-520/40 etc.
  const GRAVITY_PER_TILE = 55;        // px/s² per tile
  const JUMP_VELOCITY_PER_TILE = 18;  // px/s per tile, upward
  const BASE_SPEED_PER_TILE = 6;      // px/s per tile
  const MAX_SPEED_PER_TILE = 13;      // px/s per tile
  // Phone layout (keep in sync with the max-width breakpoint in styles.css):
  // Mario starts further left to match Figma mobile-home.
  const PHONE_MQ = window.matchMedia('(max-width: 700px)');
  const marioLeftTiles = () => (PHONE_MQ.matches ? 0.27 : 1.2);
  let MARIO_LEFT_TILES = marioLeftTiles();
  const HITBOX_INSET_TILES = 0.15;
  const SPEED_RAMP_MS = 10000;    // ramp difficulty every 10s
  const SPEED_RAMP_MULT = 1.15;
  const OBSTACLE_MIN_MS = 1200;
  const OBSTACLE_MAX_MS = 2500;
  const SCORE_PER_SEC_AT_BASE = 12;

  // Mario's actual max jump height (peak of v²/2g under constant gravity),
  // in tiles — derived from the same constants the physics loop uses, so it
  // can never drift out of sync with the real jump the way a second
  // hardcoded number could. Every floating spawn height below is expressed
  // as a fraction of THIS, not as its own independent tile count.
  const MAX_JUMP_HEIGHT_TILES = (JUMP_VELOCITY_PER_TILE * JUMP_VELOCITY_PER_TILE) / (2 * GRAVITY_PER_TILE); // ≈2.945

  // Coins: spawned independently of obstacles, in the air, within Mario's
  // jump arc, near the peak (per the Figma mario_jump reference, node
  // 4149:9444 — the 8 "jump" frames aren't an animatable arc, so the jump
  // itself stays gravity-driven; the reference's block-contact height only
  // informed how "near the peak" coins should sit).
  const COIN_HEIGHT_RATIO = 0.68; // of MAX_JUMP_HEIGHT_TILES
  const COIN_HEIGHT_TILES = MAX_JUMP_HEIGHT_TILES * COIN_HEIGHT_RATIO;
  const COIN_BONUS = 50; // a few seconds' worth of running score, in one grab
  const COIN_MIN_MS = 2000;
  const COIN_MAX_MS = 4000;
  const COIN_SPIN_FRAME_MS = 150;
  const COINGET_FRAME_MS = 60;      // 8 frames ≈ 480ms rise
  const COIN_SCORE_FRAME_MS = 110;  // 4 frames ≈ 440ms flash
  // Relative rise (in the same 100-unit reference the sprites share),
  // measured directly from the coinget frames' own bounding boxes.
  const COINGET_RISE_RATIO = [0, 0, 0.5, 1, 2, 1, 0.5, 0];

  // Platforms: question + normal blocks, floating at a height reachable by
  // jump from below (underside hit) and landable on top. Top surface is
  // clamped to a comfortable fraction of max jump height (not the full
  // theoretical peak), so both the bonk and the landing have real timing
  // margin instead of requiring frame-perfect input.
  const PLATFORM_TOP_REACH_RATIO = 0.75; // of MAX_JUMP_HEIGHT_TILES
  const PLATFORM_TOP_TILES = MAX_JUMP_HEIGHT_TILES * PLATFORM_TOP_REACH_RATIO;
  const PLATFORM_HEIGHT_TILES = PLATFORM_TOP_TILES - 1; // bottom = top - 1 tile (block height)
  const PLATFORM_MIN_MS = 2500;
  const PLATFORM_MAX_MS = 4500;
  const PLATFORM_QUESTION_CHANCE = 0.6;

  // Pipe: taller (native 208x195 vs blocks' 100x100 — ratio 1.95) and sits
  // directly on the ground, not floating. Its own height (1.95 tiles) is
  // comfortably under MAX_JUMP_HEIGHT_TILES (≈2.945, ~66%), so it's a real
  // landable platform, not just a ground obstacle to jump over.
  const PIPE_HEIGHT_TILES = 1.95;
  const PIPE_WIDTH_TILES = 2.08;
  const PIPE_MIN_MS = 3000;
  const PIPE_MAX_MS = 6000;

  let TILE = 40;
  let GROUND_HEIGHT = 40;
  let GRAVITY = GRAVITY_PER_TILE * TILE;
  let JUMP_VELOCITY = JUMP_VELOCITY_PER_TILE * TILE;
  let BASE_SPEED = BASE_SPEED_PER_TILE * TILE;
  let MAX_SPEED = MAX_SPEED_PER_TILE * TILE;
  let MARIO_LEFT = MARIO_LEFT_TILES * TILE;
  let HITBOX_INSET = HITBOX_INSET_TILES * TILE;

  function updateTileScale() {
    // getComputedStyle on a custom property returns its raw token text
    // (e.g. "clamp(40px, 5vw, 100px)"), not a resolved px value — so read
    // the actual rendered size of a dedicated var(--tile)-sized probe
    // element instead. Used to read Mario's own rendered width for this,
    // but Mario (and goomba/koopa) are now sized independently of --tile
    // on mobile — a 84px sprite standing on a 56px ground grid, per the
    // Figma mobile spec — so measuring Mario would read his fixed sprite
    // size instead of the actual physics grid unit.
    TILE = parseFloat(getComputedStyle(gameTileProbe).width) || 40;
    // Ground height is read from the ground element's own rendered height
    // rather than assumed to equal TILE — mobile's ground is 3 stacked
    // tile-rows (168px), not 1, so entities need to sit that much higher.
    GROUND_HEIGHT = parseFloat(getComputedStyle(gameGround).height) || TILE;
    GRAVITY = GRAVITY_PER_TILE * TILE;
    JUMP_VELOCITY = JUMP_VELOCITY_PER_TILE * TILE;
    BASE_SPEED = BASE_SPEED_PER_TILE * TILE;
    MAX_SPEED = MAX_SPEED_PER_TILE * TILE;
    MARIO_LEFT = MARIO_LEFT_TILES * TILE;
    HITBOX_INSET = HITBOX_INSET_TILES * TILE;
    gameMario.style.left = MARIO_LEFT + 'px';
  }

  const gameArea        = document.getElementById('gameArea');
  const gameScene       = document.getElementById('gameScene');
  const gameMario       = document.getElementById('gameMario');
  const gameObstaclesEl = document.getElementById('gameObstacles');
  const gameCoinsEl     = document.getElementById('gameCoins');
  const gamePlatformsEl = document.getElementById('gamePlatforms');
  const gameEffectsEl   = document.getElementById('gameEffects');
  const gameGround      = document.getElementById('gameGround');
  const gameTileProbe   = document.getElementById('gameTileProbe');
  const gameHud         = document.getElementById('gameHud');
  const gameScoreEl     = document.getElementById('gameScore');
  const gameFinalScoreEl = document.getElementById('gameFinalScore');
  // Decorative-only elements built to match the Figma idle screen — these
  // are NOT part of any collidable system (spawnPlatform/spawnObstacle spawn
  // the real, interactive ones). They must be hidden once a run starts, or
  // they scroll on top of it and read as duplicate/fake objects layered
  // over the real gameplay ones — .game-goomba-deco was the same bug as
  // the blocks below it, just missed in that earlier fix.
  const gameIdleDeco    = gameScene.querySelectorAll('.game-block-float, .game-block-row, .game-goomba-deco');
  const gameIdleOverlay = document.getElementById('gameIdleOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const gamePlayBtn     = document.getElementById('gamePlayBtn');
  const gameRestartBtn  = document.getElementById('gameRestartBtn');
  const gameIdleHint    = document.getElementById('gameIdleHint');
  const gameOverHint    = document.getElementById('gameOverHint');
  const gameCloseBtn    = document.getElementById('gameCloseBtn');

  // (hover: none) + (pointer: coarse) is the standard check for "primary
  // input is touch" — unlike a raw ontouchstart/matchMedia(pointer) check,
  // this doesn't false-positive on touch-capable laptops that are actually
  // being driven with a mouse/trackpad.
  const isTouchPrimary = matchMedia('(hover: none) and (pointer: coarse)').matches;
  gameIdleHint.textContent = isTouchPrimary ? 'or tap anywhere to play' : 'or press space to play';
  gameOverHint.textContent = isTouchPrimary ? 'or tap anywhere to restart' : 'or press space to restart';

  let state = 'idle'; // 'idle' | 'running' | 'gameover'
  let marioY = 0, velocityY = 0, isJumping = false;
  let gameSpeed = BASE_SPEED;
  let groundOffset = 0;
  let score = 0;
  let runElapsed = 0;
  let nextObstacleIn = 0;
  let obstacleFrameElapsed = 0;
  let obstacleFrame2 = false;
  let obstacles = []; // { el, type, x, width }
  let coins = [];      // { el, x, frameElapsed, frame }
  let effects = [];    // { kind: 'coinget'|'coin-score', el, x, y, elapsed, iconEl? }
  let nextCoinIn = 0;
  let platforms = []; // { el, type: 'question'|'normal'|'pipe', x, bottom, width, height, hit }
  let nextPlatformIn = 0;
  let nextPipeIn = 0;
  let decor = null;   // lazily built from [data-depth] elements
  let lastTime = 0;

  function rand(min, max) { return min + Math.random() * (max - min); }

  function buildDecor() {
    const sceneWidth = gameScene.clientWidth;
    return Array.from(gameScene.querySelectorAll('[data-depth]')).map(el => {
      const baseLeft = el.getBoundingClientRect().left - gameScene.getBoundingClientRect().left;
      return { el, depth: parseFloat(el.dataset.depth), baseLeft, offset: 0, width: el.offsetWidth, sceneWidth };
    });
  }

  function scrollDecor(dt) {
    if (!decor) decor = buildDecor();
    for (const d of decor) {
      d.offset -= gameSpeed * d.depth * dt;
      if (d.baseLeft + d.offset + d.width < 0) {
        d.offset += d.sceneWidth + d.width;
      }
      d.el.style.transform = `translateX(${d.offset}px)`;
    }
  }

  function resetMario() {
    marioY = 0;
    velocityY = 0;
    isJumping = false;
    gameMario.classList.remove('jumping');
    gameMario.style.bottom = GROUND_HEIGHT + 'px';
  }

  function clearObstacles() {
    obstacles.forEach(o => o.el.remove());
    obstacles = [];
  }

  function spawnObstacle() {
    const type = Math.random() < 0.5 ? 'goomba' : 'koopa';
    const el = document.createElement('div');
    el.className = 'game-obstacle ' + type;
    const x = gameScene.clientWidth;
    el.style.left = x + 'px';
    gameObstaclesEl.appendChild(el);
    obstacles.push({ el, type, x, width: TILE });
  }

  function clearCoins() {
    coins.forEach(c => c.el.remove());
    coins = [];
  }

  function spawnCoin() {
    const el = document.createElement('div');
    el.className = 'game-coin';
    const x = gameScene.clientWidth;
    el.style.left = x + 'px';
    el.style.bottom = (GROUND_HEIGHT + COIN_HEIGHT_TILES * TILE) + 'px';
    gameCoinsEl.appendChild(el);
    coins.push({ el, x, width: TILE, frameElapsed: 0, frame: 1 });
  }

  function clearEffects() {
    effects.forEach(e => e.el.remove());
    effects = [];
  }

  function clearPlatforms() {
    platforms.forEach(p => p.el.remove());
    platforms = [];
  }

  function spawnPlatform() {
    const type = Math.random() < PLATFORM_QUESTION_CHANCE ? 'question' : 'normal';
    const el = document.createElement('div');
    el.className = 'game-platform ' + type;
    const x = gameScene.clientWidth;
    const bottom = PLATFORM_HEIGHT_TILES * TILE;
    el.style.left = x + 'px';
    el.style.bottom = (GROUND_HEIGHT + bottom) + 'px';
    gamePlatformsEl.appendChild(el);
    platforms.push({ el, type, x, bottom, width: TILE, height: TILE, hit: false });
  }

  // Pipe: ground-level, taller and wider than a block. Reuses the same
  // platforms array/landing logic (generalized to per-entity width/height)
  // so top-surface landing "just works" the same way blocks get it — plus
  // a fatal side-collision check (below, alongside obstacle collision) for
  // hitting its body without having cleared the top.
  function spawnPipe() {
    const el = document.createElement('div');
    el.className = 'game-platform pipe';
    const x = gameScene.clientWidth;
    const bottom = 0; // ground level, same reference marioY=0 uses
    el.style.left = x + 'px';
    el.style.bottom = (GROUND_HEIGHT + bottom) + 'px';
    gamePlatformsEl.appendChild(el);
    platforms.push({ el, type: 'pipe', x, bottom, width: PIPE_WIDTH_TILES * TILE, height: PIPE_HEIGHT_TILES * TILE, hit: true });
  }

  // Underside hit: bounce feedback (shared with normal blocks, applied by the
  // caller), turn into a used block (reusing block-normal.png, matching the
  // classic look), one-time bonus — same effects the jump-catch coin uses.
  function hitQuestionBlock(p) {
    p.hit = true;
    p.el.classList.add('hit');
    score += COIN_BONUS;
    spawnCatchEffects(p.x, p.bottom + TILE, COIN_BONUS);
  }

  function spawnCatchEffects(x, bottom, bonus) {
    // bottom is the abstract physics height (ground level = 0); rendering
    // needs the same +GROUND_HEIGHT offset every other sprite gets, since
    // the ground graphic itself occupies the scene's bottom tile.
    const coinget = document.createElement('div');
    coinget.className = 'game-coinget';
    coinget.style.left = (x + TILE * 0.43) + 'px';
    coinget.style.bottom = (GROUND_HEIGHT + bottom) + 'px';
    gameEffectsEl.appendChild(coinget);
    effects.push({ kind: 'coinget', el: coinget, baseBottom: bottom, elapsed: 0, frame: 1 });

    const popup = document.createElement('div');
    popup.className = 'game-coin-score';
    popup.style.left = (x + TILE * 0.2) + 'px';
    popup.style.bottom = (GROUND_HEIGHT + bottom + TILE) + 'px';
    popup.innerHTML = '<span class="game-coin-score-icon"></span><span class="game-coin-score-value">+' + bonus + '</span>';
    gameEffectsEl.appendChild(popup);
    effects.push({ kind: 'coin-score', el: popup, baseBottom: bottom + TILE, elapsed: 0, frame: 1 });
  }

  function showIdle() {
    state = 'idle';
    updateTileScale();
    clearObstacles();
    clearCoins();
    clearEffects();
    clearPlatforms();
    resetMario();
    score = 0;
    gameScoreEl.textContent = '0';
    gameHud.hidden = true;
    gameOverOverlay.hidden = true;
    gameIdleOverlay.hidden = false;
    gameIdleDeco.forEach(el => { el.style.display = ''; });
    // scrollDecor() only runs during the loop (state 'running'), so a run
    // that scrolled these left via translateX and then ended leaves that
    // offset applied forever — invisible previously (closing hid the whole
    // area), but idle is now a real visible resting state, so it has to be
    // reset back to each element's intrinsic CSS position explicitly.
    gameScene.querySelectorAll('[data-depth]').forEach(el => { el.style.transform = ''; });
    decor = null; // rebuild on next scroll — positions/sizes may have changed
    // Idle is the page's default view — icons visible alongside the prompt
    // (matches Figma's "mobile-home" reference), no X since there's nothing
    // open yet. This is also what tapping X calls, so closing always lands
    // back on exactly this same state, not a separate hidden one.
    document.body.classList.remove('game-active');
    gameCloseBtn.hidden = true;
    syncCat(); // called directly, not just via the document click listener —
               // showIdle() can also run from a Space-key press, which never
               // fires the click-based sync
  }

  function startRun() {
    if (document.querySelector('.modal-overlay.open')) return;
    state = 'running';
    updateTileScale();
    clearObstacles();
    clearCoins();
    clearEffects();
    clearPlatforms();
    resetMario();
    gameSpeed = BASE_SPEED;
    score = 0;
    runElapsed = 0;
    nextObstacleIn = rand(OBSTACLE_MIN_MS, OBSTACLE_MAX_MS);
    nextCoinIn = rand(COIN_MIN_MS, COIN_MAX_MS);
    nextPlatformIn = rand(PLATFORM_MIN_MS, PLATFORM_MAX_MS);
    nextPipeIn = rand(PIPE_MIN_MS, PIPE_MAX_MS);
    gameIdleDeco.forEach(el => { el.style.display = 'none'; });
    decor = null; // rebuild — sizes/positions may have changed since last run
    gameScoreEl.textContent = '0';
    gameIdleOverlay.hidden = true;
    gameOverOverlay.hidden = true;
    gameHud.hidden = false;
    // Gameplay in progress — icons hide, X appears (stays up through gameover
    // too; only tapping it, i.e. showIdle(), brings icons back).
    document.body.classList.add('game-active');
    gameCloseBtn.hidden = false;
    syncCat(); // same reasoning as showIdle() — startRun() can be triggered by Space too
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function endRun() {
    state = 'gameover';
    gameHud.hidden = true;
    gameFinalScoreEl.textContent = Math.floor(score);
    gameOverOverlay.hidden = false;
  }

  function jump() {
    if (state !== 'running' || isJumping) return;
    isJumping = true;
    velocityY = JUMP_VELOCITY;
    gameMario.classList.add('jumping');
  }

  function aabbOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
  }

  function loop(timestamp) {
    if (state !== 'running') return;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // clamp to avoid huge steps on tab-switch
    lastTime = timestamp;

    // Difficulty ramp
    runElapsed += dt * 1000;
    if (runElapsed >= SPEED_RAMP_MS) {
      runElapsed = 0;
      gameSpeed = Math.min(MAX_SPEED, gameSpeed * SPEED_RAMP_MULT);
    }

    // Spawn + move platforms (question/normal blocks + pipes) before Mario's
    // physics resolve against them, so collision uses this frame's positions.
    nextPlatformIn -= dt * 1000;
    if (nextPlatformIn <= 0) {
      spawnPlatform();
      nextPlatformIn = rand(PLATFORM_MIN_MS, PLATFORM_MAX_MS);
    }
    nextPipeIn -= dt * 1000;
    if (nextPipeIn <= 0) {
      spawnPipe();
      nextPipeIn = rand(PIPE_MIN_MS, PIPE_MAX_MS);
    }
    platforms = platforms.filter(p => {
      p.x -= gameSpeed * dt;
      p.el.style.left = p.x + 'px';
      if (p.x + p.width < 0) {
        p.el.remove();
        return false;
      }
      return true;
    });

    // Mario vertical physics: gravity, landing on platform/pipe tops (same
    // rule as the ground), and bonking a platform's underside while rising.
    // Widths/heights are per-entity so the taller, wider pipe uses the same
    // logic as the 1-tile blocks.
    {
      const feetLeft = MARIO_LEFT + HITBOX_INSET;
      const feetRight = MARIO_LEFT + TILE - HITBOX_INSET;
      const overlapsX = p => p.x + p.width > feetLeft && p.x < feetRight;

      // Surface Mario is currently over (his own platform top, or true ground).
      let supportY = 0;
      for (const p of platforms) {
        if (!overlapsX(p)) continue;
        const top = p.bottom + p.height;
        if (top <= marioY + 0.5 && top > supportY) supportY = top;
      }
      if (!isJumping && marioY > supportY + 0.01) {
        isJumping = true; // the platform under him scrolled away — fall
      }

      if (isJumping) {
        velocityY -= GRAVITY * dt;
        let newY = marioY + velocityY * dt;

        if (velocityY > 0) {
          // Rising — check for a bonk against a platform's underside
          for (const p of platforms) {
            if (!overlapsX(p)) continue;
            const bottomEdge = p.bottom;
            if (marioY + TILE <= bottomEdge && newY + TILE > bottomEdge) {
              newY = bottomEdge - TILE;
              velocityY = 0;
              p.el.classList.add('bounce');
              if (p.type === 'question' && !p.hit) hitQuestionBlock(p);
              break;
            }
          }
        } else {
          // Falling — land on a platform/pipe top if one is under his feet
          for (const p of platforms) {
            if (!overlapsX(p)) continue;
            const top = p.bottom + p.height;
            if (marioY >= top - 0.01 && newY <= top) {
              newY = top;
              velocityY = 0;
              isJumping = false;
              break;
            }
          }
          if (newY <= 0) {
            newY = 0;
            velocityY = 0;
            isJumping = false;
          }
        }

        marioY = newY;
        gameMario.classList.toggle('jumping', isJumping);
        gameMario.style.bottom = (GROUND_HEIGHT + marioY) + 'px';
      }
    }

    // Ground scroll
    groundOffset -= gameSpeed * dt;
    if (groundOffset < -TILE) groundOffset += TILE;
    gameGround.style.backgroundPositionX = groundOffset + 'px';

    // Background decoration parallax scroll
    scrollDecor(dt);

    // Obstacle frame animation (shared 2-frame walk cycle)
    obstacleFrameElapsed += dt * 1000;
    if (obstacleFrameElapsed >= 200) {
      obstacleFrameElapsed = 0;
      obstacleFrame2 = !obstacleFrame2;
      obstacles.forEach(o => o.el.classList.toggle('frame-2', obstacleFrame2));
    }

    // Spawn obstacles
    nextObstacleIn -= dt * 1000;
    if (nextObstacleIn <= 0) {
      spawnObstacle();
      nextObstacleIn = rand(OBSTACLE_MIN_MS, OBSTACLE_MAX_MS);
    }

    // Spawn coins — independent timer, so they don't always line up with obstacles
    nextCoinIn -= dt * 1000;
    if (nextCoinIn <= 0) {
      spawnCoin();
      nextCoinIn = rand(COIN_MIN_MS, COIN_MAX_MS);
    }

    let collided = false;

    // Pipe body collision: solid like a wall unless Mario's feet have
    // already reached its top surface (landed/standing on it, handled by
    // the platform physics above). Side contact is pipe-specific — unlike
    // a goomba/koopa, it doesn't end the run on contact. Instead it blocks
    // forward movement: platforms already scrolled left this frame (above),
    // so pinning Mario flush with the pipe's leading edge pushes MARIO_LEFT
    // back by exactly that frame's scroll distance, i.e. he's carried
    // backward with the world while the pipe blocks him. That's his window
    // to jump clear (top-surface landing is unaffected, handled above).
    // Only running out of screen entirely while still blocked ends the run.
    let pipeBlocked = false;
    for (const p of platforms) {
      if (p.type !== 'pipe') continue;
      const top = p.bottom + p.height;
      if (marioY >= top - 0.01) continue; // cleared it, standing on top — safe
      const testBox = {
        left: MARIO_LEFT + HITBOX_INSET, right: MARIO_LEFT + TILE - HITBOX_INSET,
        bottom: marioY, top: marioY + TILE - HITBOX_INSET,
      };
      const pipeBox = { left: p.x + HITBOX_INSET, right: p.x + p.width - HITBOX_INSET, bottom: p.bottom, top };
      const overlap = testBox.right - pipeBox.left;
      if (overlap > 0 && aabbOverlap(testBox, pipeBox)) {
        MARIO_LEFT -= overlap;
        pipeBlocked = true;
      }
    }
    // Once clear of every pipe and back on solid ground (not mid-jump, so
    // this never fights a landing arc), ease back to the resting position —
    // otherwise repeated pipes would permanently eat into his screen room.
    if (!pipeBlocked && marioY === 0 && !isJumping && MARIO_LEFT < MARIO_LEFT_TILES * TILE) {
      MARIO_LEFT = Math.min(MARIO_LEFT_TILES * TILE, MARIO_LEFT + gameSpeed * dt);
    }
    if (pipeBlocked || MARIO_LEFT !== MARIO_LEFT_TILES * TILE) {
      gameMario.style.left = MARIO_LEFT + 'px';
    }
    if (MARIO_LEFT + TILE <= 0) {
      collided = true; // pushed fully off the left edge while blocked — game over
    }

    // Move + cull obstacles, check collision
    const marioBox = {
      left: MARIO_LEFT + HITBOX_INSET, right: MARIO_LEFT + TILE - HITBOX_INSET,
      bottom: marioY, top: marioY + TILE - HITBOX_INSET,
    };

    obstacles = obstacles.filter(o => {
      o.x -= gameSpeed * dt;
      o.el.style.left = o.x + 'px';
      if (o.x + o.width < 0) {
        o.el.remove();
        return false;
      }
      const obstacleBox = { left: o.x + HITBOX_INSET, right: o.x + TILE - HITBOX_INSET, bottom: 0, top: TILE - HITBOX_INSET };
      if (aabbOverlap(marioBox, obstacleBox)) collided = true;
      return true;
    });

    // Move + cull coins, spin frames, and check the catch (jump-only, independent
    // of obstacle collision — both run every frame regardless of the other).
    const coinBottom = COIN_HEIGHT_TILES * TILE;
    coins = coins.filter(c => {
      c.x -= gameSpeed * dt;
      c.el.style.left = c.x + 'px';
      if (c.x + c.width < 0) {
        c.el.remove();
        return false;
      }
      c.frameElapsed += dt * 1000;
      if (c.frameElapsed >= COIN_SPIN_FRAME_MS) {
        c.frameElapsed = 0;
        c.frame = (c.frame % 4) + 1;
        c.el.className = 'game-coin' + (c.frame > 1 ? ' f' + c.frame : '');
      }
      if (isJumping) {
        const coinBox = {
          left: c.x + HITBOX_INSET, right: c.x + TILE - HITBOX_INSET,
          bottom: coinBottom + HITBOX_INSET, top: coinBottom + TILE - HITBOX_INSET,
        };
        if (aabbOverlap(marioBox, coinBox)) {
          c.el.remove();
          score += COIN_BONUS;
          spawnCatchEffects(c.x, coinBottom, COIN_BONUS);
          return false;
        }
      }
      return true;
    });

    // Advance catch effects (coinget rise + coin_score flash), remove when done
    effects = effects.filter(e => {
      e.elapsed += dt * 1000;
      if (e.kind === 'coinget') {
        const frameMs = COINGET_FRAME_MS;
        const idx = Math.min(7, Math.floor(e.elapsed / frameMs));
        const frame = idx + 1;
        if (frame !== e.frame) {
          e.frame = frame;
          e.el.className = 'game-coinget' + (frame > 1 ? ' f' + frame : '');
        }
        e.el.style.transform = 'translateY(' + (-COINGET_RISE_RATIO[idx] * TILE) + 'px)';
        if (e.elapsed >= frameMs * 8) {
          e.el.remove();
          return false;
        }
      } else {
        const frame = Math.min(4, Math.floor(e.elapsed / COIN_SCORE_FRAME_MS) + 1);
        if (frame !== e.frame) {
          e.frame = frame;
          const icon = e.el.querySelector('.game-coin-score-icon');
          icon.className = 'game-coin-score-icon' + (frame > 1 ? ' f' + frame : '');
        }
        const progress = Math.min(1, e.elapsed / (COIN_SCORE_FRAME_MS * 4));
        e.el.style.transform = 'translateY(' + (-progress * TILE * 0.6) + 'px)';
        e.el.style.opacity = String(1 - progress);
        if (e.elapsed >= COIN_SCORE_FRAME_MS * 4) {
          e.el.remove();
          return false;
        }
      }
      return true;
    });

    // Scoring (distance-based, scaled by current speed)
    score += (gameSpeed / BASE_SPEED) * SCORE_PER_SEC_AT_BASE * dt;
    gameScoreEl.textContent = Math.floor(score);

    if (collided) {
      endRun();
      return;
    }

    requestAnimationFrame(loop);
  }

  // Visible on the homepage from page load — idle state (Figma's "Want to
  // play a quick game?" heading + Play button, icons alongside it) right
  // away. Clicking Play (or pressing space, or tapping anywhere) launches
  // the run directly — one click, one step.
  showIdle();

  // Re-measure when the viewport changes (devtools, rotation, window snap).
  // Tile size and ground height are otherwise only read at idle/run start,
  // so after a resize Mario kept his old inline `bottom` and floated above
  // (or sank into) the ground. A running round is left alone — changing the
  // physics grid mid-run would break obstacle/hitbox math; it re-measures
  // on the next idle/run start.
  let resizeQueued = false;
  window.addEventListener('resize', () => {
    if (resizeQueued || state === 'running') return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      if (state === 'running') return;
      MARIO_LEFT_TILES = marioLeftTiles();
      if (state === 'idle') {
        showIdle();
      } else {
        updateTileScale();
        gameMario.style.bottom = GROUND_HEIGHT + 'px';
        decor = null;
      }
    });
  });

  gamePlayBtn.addEventListener('click', startRun);
  gameRestartBtn.addEventListener('click', startRun);
  // X just returns to idle — showIdle() already resets everything (icons
  // back, X itself hidden again) since that's the same state page load
  // starts in. No separate "closed" state to track.
  gameCloseBtn.addEventListener('click', showIdle);

  // Tap-to-play/jump/restart: same three-state branching as the Space key
  // below, so touch has full parity with keyboard. Guard against the Play/
  // Start-over/Close buttons' own click handlers above — their click bubbles
  // up to gameArea too, and without this guard a tap on Play would
  // startRun() once from the button then immediately jump() again from this
  // handler (state is already 'running' by the time the bubbled event
  // arrives) — same reasoning applies to Close firing a spurious jump/start.
  // While any modal (Send a message, About, Projects, Bin, case study) is
  // open, the game must not react to input: Space has to type a space in the
  // form instead of starting a run behind the window.
  const isModalOpen = () => !!document.querySelector('.modal-overlay.open');

  gameArea.addEventListener('click', (e) => {
    if (isModalOpen()) return;
    if (e.target.closest('.game-btn, .game-close-btn')) return;
    if (state === 'idle') startRun();
    else if (state === 'running') jump();
    else if (state === 'gameover') startRun();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    if (isModalOpen()) return; // leave the keypress alone so inputs get their space
    e.preventDefault();
    if (state === 'idle') startRun();
    else if (state === 'running') jump();
    else if (state === 'gameover') startRun();
  });
})();

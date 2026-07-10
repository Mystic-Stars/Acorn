fetch('https://me.mysticstars.cn/zh')
  .then(r => r.text())
  .then(html => {
    const skillsSection = html.split('id="skills"')[1];
    if (skillsSection) {
      const skills = skillsSection.split('id="subscribe"')[0];
      const items = skills.match(/<li[^>]*>(.*?)<\/li>/g);
      console.log(items.map(item => item.replace(/<[^>]+>/g, '').trim()));
    } else {
      console.log('not found');
    }
  });

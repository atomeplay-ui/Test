// ===== DONNÉES DE LA "CHASSE AUX SOUVENIRS" =====
// Modifiez cette liste pour personnaliser vos souvenirs.
// IMPORTANT : chaque "id" doit être UNIQUE, sans espace, sans accent
// (il est utilisé dans l'URL encodée dans le QR code : /?souvenir=<id>).
//
// Ce fichier est utilisé à la fois par :
//   - index.html          (page principale, écran "Chasse aux souvenirs")
//   - qr-souvenirs.html   (page pour générer/imprimer les QR codes à cacher)

const SOUVENIRS = [
    {
        id: 'bouquet',
        icon: '💐',
        title: 'Le bouquet oublié',
        clue: "Cherche près de l'endroit où la mariée s'est préparée avant la cérémonie...",
        story: "Ce bouquet a été composé avec les fleurs préférées de la grand-mère d'Inès, en souvenir du jardin où elle a grandi. Un clin d'œil discret à trois générations de femmes de la famille. 🌸"
    },
    {
        id: 'lettre',
        icon: '💌',
        title: 'La lettre secrète',
        clue: "Regarde sous la table où l'on signe le livre d'or.",
        story: "Cette lettre, c'est celle que Valentin a écrite à Inès la veille de leur premier rendez-vous, sans jamais avoir eu le courage de la lui donner... jusqu'à aujourd'hui. 💕"
    },
    {
        id: 'photo-jeunesse',
        icon: '📷',
        title: "La photo d'enfance",
        clue: 'Cherche parmi les souvenirs de famille exposés dans la salle.',
        story: "Sur cette photo, Inès et Valentin ont 7 ans. Ils ont passé le même été dans le même camping, sans jamais se croiser... 15 ans avant de se rencontrer pour de vrai ! 🏖️"
    },
    {
        id: 'alliance',
        icon: '💍',
        title: 'L\'esquisse des alliances',
        clue: 'Demande au témoin le plus proche de la piste de danse.',
        story: "Le bijoutier a dessiné cette esquisse pendant qu'Inès et Valentin choisissaient la forme de leurs anneaux, un dimanche pluvieux de novembre. ✏️💍"
    },
    {
        id: 'chanson',
        icon: '🎵',
        title: 'La chanson de leur rencontre',
        clue: 'Cherche près de la sonorisation / du DJ.',
        story: "Cette chanson jouait au bar le soir où Inès et Valentin se sont parlé pour la première fois, il y a 5 ans. Elle passera ce soir, à minuit... 🎶"
    }
];

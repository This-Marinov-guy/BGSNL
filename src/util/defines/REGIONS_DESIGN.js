import React from 'react'
import { FaInstagram, FaFlickr, FaLinkedinIn, FaLinkedin, FaFacebookF, FaMailBulk } from "react-icons/fa";

export const BG_INDEX = 23

export const REGIONS = [
    'amsterdam', 'breda', 'eindhoven', 'groningen', 'leeuwarden', 'maastricht', 'rotterdam'
]

export const REGION_MAIN_COLOR = {
    groningen: '#f92820',
    rotterdam: '#f92820',
    leeuwarden: '#ffbd59',
    breda : '#FF8F47',
    amsterdam: '#014CB2',
    maastricht: '#FBBF54',
    eindhoven: '#FF914D'
}

export const REGION_SECOND_COLOR = {
    groningen: '#017363',
    rotterdam: '#004AB0',
    leeuwarden: '#ff914d',
    breda : '#F64535',
    amsterdam: '#007862',
    maastricht: '#381096',
    eindhoven: '#24632D'
}

export const REGION_EMAIL = {
    netherlands: 'bulgariansociety.nl@gmail.com',
    groningen: 'bulgariansociety.gro@gmail.com',
    rotterdam: 'bulgariansociety.rtm@gmail.com',
    leeuwarden: 'bulgariansociety.lwd@gmail.com',
    breda : 'bulgariansociety.bre@gmail.com',
    amsterdam: 'bulgariansociety.ams@gmail.com',
    maastricht: 'bulgariansociety.maas@gmail.com',
    eindhoven: 'bulgariansociety.eind@gmail.com'
}

export const REGION_WHATSAPP = {
    groningen: 'https://chat.whatsapp.com/HE2IVMvTTbs88NXWSE3Eqn',
    rotterdam: 'https://chat.whatsapp.com/GDjhKTE6tVaEbbkXw35A1M',
    leeuwarden: '',
    breda : '',
    amsterdam: 'https://chat.whatsapp.com/JVSM61uSkBB61oysBvABUm',
    maastricht: '',
    eindhoven: ''
}

export const REGION_FLICKER = {
    netherlands: "https://flickr.com",
    groningen: "https://flickr.com/photos/197725983@N03/albums",
    rotterdam: "https://www.flickr.com/people/199586823@N02/",
    leeuwarden : "https://flickr.com",
    breda : '',
    amsterdam: '',
    maastricht: '',
    eindhoven: ''
}

export const REGION_INSTAGRAM = {
    netherlands: 'https://www.instagram.com/bulgariansociety.netherlands',
    groningen: 'https://www.instagram.com/bulgariansociety.gro',
    rotterdam: 'https://www.instagram.com/bulgariansociety.rtm',
    leeuwarden: 'https://www.instagram.com/bulgariansociety.lwd',
    breda: 'https://www.instagram.com/bulgariansociety.bred',
    amsterdam: 'https://www.instagram.com/bulgariansociety.ams',
    maastricht: 'https://www.instagram.com/bulgariansociety.maas',
    eindhoven: 'https://www.instagram.com/bulgariansociety.ein'
}

export const REGION_SOCIALS = {
    netherlands: [
        { Social: <FaInstagram />, link: "https://www.instagram.com/bulgariansociety.netherlands/" },
        {
            Social: <FaLinkedin />,
            link: "https://www.linkedin.com/company/bulgarian-society-netherlands",
        },
        {
            Social: <FaMailBulk />,
            link: 'mailto:' + REGION_EMAIL.netherlands
        }
    ],
    groningen: [
        { Social: <FaInstagram />, link: "https://www.instagram.com/bulgariansociety.gro/" },
        {
            Social: <FaFacebookF />,
            link: "https://www.facebook.com/profile.php?id=100090061861023",
        },
        {
            Social: <FaFlickr />,
            link: "https://flickr.com/photos/197725983@N03/albums",
        },
    ],
    rotterdam: [
        {
            Social: <FaInstagram />,
            link: "https://www.instagram.com/bulgariansociety.rtm/",
        },
        {
            Social: <FaLinkedin />,
            link: "  https://www.linkedin.com/company/bulgarian-society-rotterdam",
        },
        {
            Social: <FaFlickr />,
            link: "https://www.flickr.com/people/199586823@N02/",
        },
    ],
    leeuwarden: [{
        Social: <FaInstagram />,
        link: "https://www.instagram.com/bulgariansociety.lwd/",
    }],
    breda : [{
        Social: <FaInstagram />,
        link: "https://www.instagram.com/bulgariansociety.bred/",
    }],
    amsterdam: [{
        Social: <FaInstagram />,
        link: "https://www.instagram.com/bulgariansociety.ams/",
    }],
    maastricht: [{
        Social: <FaInstagram />,
        link: "https://www.instagram.com/bulgariansociety.maas/",
    }],
    maastricht: [{
        Social: <FaInstagram />,
        link: "https://www.instagram.com/bulgariansociety.ein/",
    }]
}

export const KVK = '88233855';
import arborec from '../assets/faction_icons/arborec_icon.png';
import argent from '../assets/faction_icons/argent_icon.png';
import creuss from '../assets/faction_icons/creuss_icon.png';
import empyrean from '../assets/faction_icons/empyrean_icon.png';
import hacan from '../assets/faction_icons/hacan_icon.png';
import jolnar from '../assets/faction_icons/jolnar_icon.png';
import keleres from '../assets/faction_icons/keleres_icon.png';
import letnev from '../assets/faction_icons/letnev_icon.png';
import l1z1x from '../assets/faction_icons/l1z1x_icon.png';
import mahact from '../assets/faction_icons/mahact_icon.png';
import mentak from '../assets/faction_icons/mentak_icon.png';
import muaat from '../assets/faction_icons/muaat_icon.png';
import naalu from '../assets/faction_icons/naalu_icon.png';
import naazrokha from '../assets/faction_icons/naazrokha_icon.png';
import nekro from '../assets/faction_icons/nekro_icon.png';
import nomad from '../assets/faction_icons/nomad_icon.png';
import norr from '../assets/faction_icons/norr_icon.png';
import saar from '../assets/faction_icons/saar_icon.png';
import sol from '../assets/faction_icons/sol_icon.png';
import ul from '../assets/faction_icons/ul_icon.png';
import vuilraith from '../assets/faction_icons/vuilraith_icon.png';
import winnu from '../assets/faction_icons/winnu_icon.png';
import xxcha from '../assets/faction_icons/xxcha_icon.png';
import yin from '../assets/faction_icons/yin_icon.png';
import yssaril from '../assets/faction_icons/yssaril_icon.png';
// import { get } from 'http';



interface PlayerBoxProps {
    playerName: string;
    color: string;
    score: number;
    faction: string;
    strategyCard?: string;
    strategyCardFlipped?: boolean;
    speaker?: boolean;
    active?: boolean;
}

function PlayerBox({
    playerName,
    color,
    score,
    faction,
    strategyCard,
    strategyCardFlipped
}: PlayerBoxProps) {


    //   --color-tiwhite: rgb(255, 255, 255); 
    //   --color-tiblue: rgb(1, 169, 203); 
    //   --color-tipurple: rgb(190, 70, 229); 
    //   --color-tired: rgb(178, 59, 77);
    //   --color-tiyellow: rgb(19, 170, 28); 
    //   --color-tigreen: rgb(1, 121, 55); 



    // get player color
    function getBGColor(color: string) {
        switch (color) {
            case 'red':
                return 'bg-tired';
            case 'blue':
                return 'bg-tiblue';
            case 'green':
                return 'bg-tigreen';
            case 'yellow':
                return 'bg-tiyellow';
            case 'white':
                return 'bg-tiwhite';
            case 'purple':
                return 'bg-tipurple';
            default:
                return 'bg-gray-500';
        }
    }

    function getTextColor(color: string) {
        switch (color) {
            case 'red':
                return 'text-tired';
            case 'blue':
                return 'text-tiblue';
            case 'green':
                return 'text-tigreen';
            case 'yellow':
                return 'text-tiyellow';
            case 'white':
                return 'text-tiwhite';
            case 'purple':
                return 'text-tipurple';
            default:
                return 'text-gray';
        }
    }

    function getFactionIcon(faction: string) {
        switch (faction) {
            case 'arborec':
                return arborec;
            case 'argent':
                return argent;
            case 'creuss':
                return creuss;
            case 'empyrean':
                return empyrean;
            case 'hacan':
                return hacan;
            case 'jolnar':
                return jolnar;
            case 'keleres':
                return keleres;
            case 'letnev':
                return letnev;
            case 'l1z1x':
                return l1z1x;
            case 'mahact':
                return mahact;
            case 'mentak':
                return mentak;
            case 'muaat':
                return muaat;
            case 'naalu':
                return naalu;
            case 'naazrohka':
                return naazrokha;
            case 'nekro':
                return nekro;
            case 'nomad':
                return nomad;
            case 'norr':
                return norr;
            case 'saar':
                return saar;
            case 'sol':
                return sol;
            case 'ul':
                return ul;
            case 'vuilraith':
                return vuilraith;
            case 'winnu':
                return winnu;
            case 'xxcha':
                return xxcha;
            case 'yin':
                return yin;
            case 'yssaril':
                return yssaril;
            default:
                return '';
        }
    }

    return (<div className="flex flex-row w-auto justify-between items-center bg-slate-800 rounded-lg border-2 border-black gap-2 p-2">
        <div className={`${getBGColor(color)} size-14 rounded-full`}>
            <img src={getFactionIcon(faction)} alt={faction} />
        </div>
        <div className="flex flex-col items-center">
            <div className={`text-xl ${getTextColor(color)}`}>
                {playerName}
            </div>
            <div className={`text-lg ${strategyCardFlipped ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {strategyCard}
            </div>
        </div>
        <div className={`${getTextColor(color)} text-6xl`}>
            {score}
        </div>
    </div>);
}

export default PlayerBox;

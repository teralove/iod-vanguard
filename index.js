String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` };
const config = require('./config.js');
    
module.exports = function IodVanguard(mod) {
    const questIds = [92321, 92322, 92323];
    const slot = 3;
    
    let enabled = config.enable,
    questId = config.questId,
    searching = false,
    searchStart = false,
    inZone = false,
    itemEquip, 
    itemUnequip;

	mod.hook('S_LOAD_TOPO', 3, event => {
		inZone = event.zone == 13;
	})
    
    mod.hook('C_EQUIP_ITEM', 2, (event) => {
        if (!enabled) return;
        if (itemUnequip && event.gameId == (itemUnequip.cid)) itemEquip = event;
	});
    
    mod.hook('C_UNEQUIP_ITEM', 1, (event) => {
        if (!enabled) return;
        if (event.slot === slot) itemUnequip = event;      
	});

    mod.hook('C_COMPLETE_DAILY_EVENT', 1, {order: 10}, (event) => {
        if (!enabled) return;
        
        if (questIds.includes(event.id)) {
            setTimeout(()=>{
                mod.send('C_AVAILABLE_EVENT_MATCHING_LIST', 1, {unk: 1});
            }, 2500);
        }
	});
    
    mod.hook('C_AVAILABLE_EVENT_MATCHING_LIST', 1, (event) => {
        if (!enabled) return;        
        if (searching) return false;
	});
    
    mod.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 2, (event) => {
        if (!enabled || searching || !inZone) return;

        // Module is done if targetted vanguard is found
        let quest = event.quests.find(p => p.id === config.questId);
        if (quest) {
            mod.command.message("Ready!".clr('56B4E9'));
            searchStart = false;
            return;
        }

        // Skip routine if no iod quest can be found
        quest = event.quests.find(p => questIds.includes(p.id));
        if (!quest && event.quests.length > 9) {
            //mod.command.message("Skipping...!".clr('FFF4E9'));
            return;
        }
        
        // Reset the vanguard requests by re-equipping gear
        if (itemEquip && itemUnequip)
        {            
            if (!searchStart) mod.command.message("Searching...");    
            searching = true;
            searchStart = true;
            
            setTimeout(()=> {
                mod.send('C_UNEQUIP_ITEM', 1, itemUnequip);
            }, 200);
            
            setTimeout(()=> {
                mod.send('C_EQUIP_ITEM', 2, itemEquip);
            }, 400);
        
            setTimeout(()=> {
                searching = false;
                mod.send('C_AVAILABLE_EVENT_MATCHING_LIST', 1, {unk: 1});
            }, 600);
            
            return false;
        } 
        else 
        {
            mod.command.message('Unequip and reequip your chest.'.clr('E69F00') );
        }
        
    })
    
    
    mod.command.add(['iodbam', 'iodbams', 'iodvanguard', 'iodvanguards'], (p1)=> {
        if (p1) p1 = p1.toLowerCase();
        if (p1 == null) {
            enabled = !enabled;
        } else if (p1 === 'off') {
            enabled = false;
        } else if (p1 === 'on') {
            enabled = true;
        }
        mod.command.message(enabled ? "Enabled" : "Disabled");
    });
    
}

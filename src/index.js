'use strict';

import { EventEmitter } from 'events';
import linuxBattery from 'linux-battery';
import isCharging  from 'is-charging';

export default class Battery extends EventEmitter {
    
    constructor(options, output) {
        super();
        options = options || {};
        this.output = output || {};

        //custom config
        this.text = options.text || '';
        this.secretValue = options.secretValue;

        this.charging = false;
        this.colors = {
            charging: '#aded89',//'#e1fce0',
            normal: '#e0e0e0',
            warning: '#f75d42'
        }

    }

    update() {

        this.emit('pause', this);
        

        isCharging()
        .then(result => {
            
            this.charging = result

            var full = '<span size="large"></span> ';
            var threequaters = '<span size="large"></span> ';
            var half = '<span size="large"></span> ';
            var onequarter = '<span size="large"></span> ';
            var empty = '<span size="large"></span> ';
            var charging = '<span size="large"></span> ';

            linuxBattery() 
            .then( res => {
                let perc = parseFloat(res[0].percentage.slice(0, res[0].percentage.length));

                let percents = ' <span size="small"><sup>' + perc + '%</sup></span>';
                var output = '';

                switch(true) {
                    case this.charging: // charging
                        output = '<span color="'+this.colors.charging+'">' + charging + percents + '</span>';
                    break;
                    case (!this.charging && perc >= 90): // charging
                        output = '<span color="'+this.colors.normal+'">' + full + percents + '</span>';
                    break;
                    case (!this.charging && perc >= 75): // charging
                        output = '<span color="'+this.colors.normal+'">' + threequaters + percents + '</span>';
                    break;
                    case (!this.charging && perc >= 50): // charging
                        output = '<span color="'+this.colors.normal+'">' + half + percents + '</span>';
                    break;
                    case (!this.charging && perc >= 15): // charging
                        output = '<span color="'+this.colors.normal+'">' + onequarter + percents + '</span>';
                    break;
                    case (!this.charging && perc < 15): // charging
                        output = '<span color="'+this.colors.warning+'">' + empty + percents + '</span>';
                    break;
                }
                this.output.full_text = output;
                this.output.short_text = output;

                this.emit('resume', this);
                this.emit('updated', this, this.output);
            });
        });
    }

    action(action) {
        if (this.__reporter && this.__reporter.supports('html')) {
            var output = {
                header: 'Starter sample',
                content: `<h1>Hello World!</h1><p>Secret value is ${this.secretValue}`,
                userStyle: 'h1 { color: red }'
            };
            this.__reporter.display(output, action);
        }
    }

}
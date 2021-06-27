

require 'mqtt/sub_handler.rb'

$mqtt = MQTT::SubHandler.new('192.168.178.230');

$valid_auth_keys = {
    'admin' => 'admin'
}

# Hash to sockets using their Session ID as key.
$sockets = {}

$TEST_CONFIG = {
    sections: {
        'Lighting' => {
            fields: {
                v2: {
                    type: 'string',
                    options: {'Dark' => false, 'Light' => true}
                },
                lightType: {
                    type: 'string',
                    options: {
                        'Off' => 'off',
                        'Auto' => 'auto',
                        'Temp.' => 'tempr',
                        'Cust.' => 'custom'
                    }
                },
                sliderTest: {
                    type: 'numeric',
                    text: 'Colour Temperature',
                    min: 1000,
                    max: 7500,
                    unit: 'K'
                },
                test: {
                    text: 'Custom Color:',
                    type: 'colour'
                },
                wifi: {
                    type: 'wifi'
                }
            }
        },
        'Sensors' => {
           minimized: true,
            fields: {
                ambient_humidity: {
                    ro: true,
                    type: 'numeric',
                    text: 'Humidity',
                    min: 20,
                    max: 80,
                    unit: '%'
                },
                ambient_brightness: {
                    ro: true,
                    text: 'Brightness',
                    type: 'numeric',
                    min: 10,
                    max: 10000,
                },
                ambient_temp: {
                    ro: true,
                    text: 'Temperature',
                    type: 'numeric',
                    unit: '°C',
                    min: 10,
                    max: 40
                },
                ambient_air_q: {
                    ro: true,
                    text: 'Air Quality',
                    type: 'numeric',
                    min: 25000,
                    max: 100000
                }
            }
        }
    }
};

$dummy_settings = {
    'lightType' => {'value' => 'off'},
    'v1' => {'value' => false},
    'v2' => {'value' => false},
    'sliderTest' => {'value' => 0, '_state' => '#FFF000'},
    'test' => {'value' => '#F00000'},
    '_device' => {
        version: 'v1.23',
        cpu_version: 'v3123',
        mac: 'E0.E2.E6.56.14.D0'
    },
    '_ping' => {
        max_heap: 123412,
        free_heap: 70312,
        ping: 12,
        bat_soc: 0.442
    }
};

$mqtt.subscribe_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/sensors' do |data|
    data = JSON.parse(data);
    data = data.map {|key, value| [key, {'value' => value.round(2)}]}.to_h

    $dummy_settings.merge!(data);

    oData = {update: data}.to_json;

    $sockets.values.each do |s|
        s[:sockets].each { |ws| ws.send oData}
    end
end

def handle_action(d)
    updated = {}

    if(d.include? 'toggle')
        [d['toggle']].flatten.each do |key|
            updated[key] = $dummy_settings[key] ? false : true;
        end
    elsif(d.include? 'set')
        d['set'].each do |key, value|
            updated[key] = value
        end
    end

    updated.filter! { |key, val| val != $dummy_settings[key] }

    oldUpdated = updated.clone

    if(oldUpdated.include? 'sliderTest')
        updated['lightType'] = {'value' => 'tempr'}
    elsif(oldUpdated.include? 'test')
        updated['lightType'] = {'value' => 'custom'}
    end
    
    if(updated.include? 'lightType')
        updated['lightType']['_state'] = {'off' => 'idle', 'auto' => 'ok', 'tempr' => 'err', 'custom' => 'warn'}[updated['lightType']['value']]
    end

    return if updated.empty?

    out_updated = {}
    updated.each do |key, value|
        $dummy_settings[key] ||= {}
        $dummy_settings[key].merge! value
    
        out_updated[key] = $dummy_settings[key]
    end

    oData = {update: out_updated}.to_json
    $sockets.values.each { |s| 
        next unless s[:authenticated]
        s[:sockets].each { |ws| ws.send oData }
    }

    if(updated.include? 'lightType')
        case updated['lightType']['value']
        when 'off'
            $mqtt.publish_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientOn', 0, retain: true, qos: 1
            $mqtt.publish_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientOverride', ''
        when 'auto'
            $mqtt.publish_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientOn', 1, retain: true, qos: 1
            $mqtt.publish_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientOverride', ''
        when 'tempr'
            $mqtt.publish_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientTemp', $dummy_settings['sliderTest']['value']
        when 'custom'
            $mqtt.publish_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientOverride', $dummy_settings['test']['value']
        end
    end
end

require 'sinatra'
require 'sinatra-websocket'

set :bind, '192.168.178.108'

get '/ws' do
    session_id = request.params['sessionID']

    if(session_id.nil? || session_id.length < 5)
        return "Invalid session ID specified!"
    end

    if(!$sockets.include?(session_id))
        $sockets[session_id] = {
            id: session_id,
            sockets: [],
            authenticated: false,
        }
    end

    if !request.websocket?
        "You should be using a websocket connection!"
    else
        response.headers['Access-Control-Allow-Origin'] = '*'

        request.websocket do |ws|
            ws.onopen do
                $sockets[session_id][:sockets] << ws;
            
                ws.send({
                    authenticated: $sockets[session_id][:authenticated]
                }.to_json)
            end

            ws.onmessage do |msg|
                puts "Got message #{msg}"

                data = JSON.parse(msg);

                if(data['logout'])
                    $sockets[session_id][:authenticated] = false
                    $sockets[session_id][:sockets].each(&:close_connection);
                end

                if(auth = data['authenticate'])
                    user = auth['user']
                    password = auth['password']

                    $sockets[session_id][:authenticated] = ($valid_auth_keys[user] == password)
                    $sockets[session_id][:authenticated] = false if $valid_auth_keys[user].nil?

                    out_data = {authenticated: $sockets[session_id][:authenticated]}

                    out_data[:store_credentials] = {user: user, password: password, stored: true} if(!auth['stored'])
                    
                    ws.send(out_data.to_json)
                end

                unless($sockets[session_id][:authenticated])
                    ws.send({authenticated: false}.to_json);
                    
                    next
                end

            
                if([data['get']].flatten.include? '_config')
                    ws.send({update: {_config: $TEST_CONFIG}.merge($dummy_settings)}.to_json);
                else
                    handle_action(data)
                end
            end

            ws.onclose do
                $sockets[session_id][:sockets].delete(ws)
            end
        end
    end
end

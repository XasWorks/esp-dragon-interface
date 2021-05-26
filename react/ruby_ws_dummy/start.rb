

require 'mqtt/sub_handler.rb'

$mqtt = MQTT::SubHandler.new('192.168.178.230');
$sockets = [];

$dummy_settings = {};

$mqtt.subscribe_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientOn' do |data|
    new_on = data == '1';

    if(new_on != $dummy_settings['v1'])
        $dummy_settings['v1'] = new_on
        oData = {update: {v1: new_on}}.to_json
        $sockets.each { |s| s.send oData }
    end
end

def handle_action(d)
    updated = {}

    if(d.include? 'toggle')
        [d['toggle']].flatten.each do |key|
            $dummy_settings[key] = $dummy_settings[key] ? false : true;
            updated[key] = $dummy_settings[key];
        end
    elsif(d.include? 'set')
        d['set'].each do |key, value|
            next if $dummy_settings[key] == value

            $dummy_settings[key] = value
            updated[key] = value
        end
    end

    return if updated.empty?

    oData = {update: updated}.to_json
    $sockets.each { |s| s.send oData }

    if(updated.include? 'v1')
        $mqtt.publish_to '/esp32/dragon-cookie/E0.E2.E6.56.14.D0/AmbientOn', updated['v1'] ? 1 : 0, retain: true, qos: 1
    end
end

require 'sinatra'
require 'sinatra-websocket'

set :bind, '*'

get '/ws' do
    if !request.websocket?
        "You should be using a websocket connection!"
    else
        response.headers['Access-Control-Allow-Origin'] = '*'

        request.websocket do |ws|
            ws.onopen do
                $sockets << ws;
            end

            ws.onmessage do |msg|
                puts "Got message #{msg}"

                data = JSON.parse(msg);
            
                if(data['action'] == 'get-settings')
                    ws.send({update: $dummy_settings}.to_json);
                else
                    handle_action(data)
                end
            end

            ws.onclose do
                $sockets.delete ws
            end
        end
    end
end
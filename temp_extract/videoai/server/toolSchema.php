<?php

$tools = [
        [
            'type' => 'function',
            'function' => [
                'name' => 'getCurrentWeather',
                'description' => 'Get the current weather in a given location',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'location' => [
                            'type' => 'string',
                            'description' => 'The city and state, e.g. San Francisco, CA',
                        ],
                        'unit' => [
                            'type' => 'string',
                            'enum' => ['celsius', 'fahrenheit']
                        ],
                    ],
                    'required' => ['location'],
                ],
            ],
        ],
        [
            'type' => 'function',
            'function' => [
                'name' => 'getPrice',
                'description' => 'Get the current price for a stock',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'symbol' => [
                            'type' => 'string',
                            'description' => 'The symbol of a stock',
                        ]
                    ],
                    'required' => ['symbol'],
                ],
            ],
        ],
        [
            'type' => 'function',
            'function' => [
                'name' => 'getCurrency',
                'description' => 'Get currency conversion',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'currency' => [
                            'type' => 'string',
                            'description' => 'Currency symbol',
                        ],
                        'quantity' => [
                            'type' => 'string'
                        ]
                    ],
                    'required' => ['currency'],
                ],
            ],
        ]
    ];